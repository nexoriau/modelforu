import { db } from "@/db";
import { generateTable, usersTable } from "@/db/schema";
import { generatedImagesTable } from "@/db/schema/generated-images";
import { eq, sql } from "drizzle-orm";
import {
  notifyGenerationComplete,
  notifyLowCredits,
} from "@/app/_others/notification/actions/create-notification";
import { trackActivity } from "@/lib/track-activity";

type GenerationResult = {
  generationId: string;
  userId: string;
  modelId: string;
  type: "photo" | "video" | "audio";
  mediaUrls: string[];
  generationTime: number;
  batchSize?: number;
  prompt: string;
  isPartialBatch?: boolean; // NEW: Indicates this is a partial update
  currentCount?: number; // NEW: Current number of images processed
  totalExpected?: number; // NEW: Total images expected in batch
};

export async function processGenerationResult(result: GenerationResult) {
  try {
    return await db.transaction(async (tx) => {
      // 1. Update Generation Record
      // Determine if this is the final completion
      const isComplete =
        result.isPartialBatch === false ||
        (result.isPartialBatch === true &&
          result.currentCount &&
          result.totalExpected &&
          result.currentCount >= result.totalExpected);

      const [updatedGen] = await tx
        .update(generateTable)
        .set({
          status: isComplete ? "COMPLETED" : "PROCESSING",
          mediaUrl: result.type === "video" ? result.mediaUrls : undefined, // Videos store URL directly in generateTable for now based on legacy schema, but photos use separate table.
          generationTime: result.generationTime,
          itemsLength: result.currentCount || result.mediaUrls.length,
        })
        .where(eq(generateTable.id, result.generationId))
        .returning();

      if (!updatedGen) throw new Error("Generation record not found");

      // 2. Insert Generated Images (if photo)
      if (result.type === "photo" && result.mediaUrls.length > 0) {
        await tx.insert(generatedImagesTable).values(
          result.mediaUrls.map((url) => ({
            generateId: result.generationId,
            imageUrl: url,
          })),
        );
      }

      // 3. Only send notifications and track activity on final completion
      // IMPORTANT: Check if we actually transitioned to COMPLETED to avoid race conditions
      // If two jobs complete simultaneously, only one should send notifications
      if (isComplete) {
        // Only notify if this is truly the FINAL completion of the entire batch
        const isFinalCompletion =
          !result.isPartialBatch ||
          (result.currentCount &&
            result.totalExpected &&
            result.currentCount >= result.totalExpected);

        // Get current generation to check if we're the one that set it to COMPLETED
        const currentGen = await tx.query.generateTable.findFirst({
          where: eq(generateTable.id, result.generationId),
        });

        // Only send notifications if:
        // 1. Status was just changed to COMPLETED by this update
        // 2. This is the final image in the batch
        const shouldNotify =
          currentGen?.status === "COMPLETED" &&
          updatedGen.status === "COMPLETED" &&
          isFinalCompletion;

        if (shouldNotify) {
          // Get User for Low Credits Check
          const user = await tx.query.usersTable.findFirst({
            where: eq(usersTable.id, result.userId),
          });

          // Get Model Name for Notifications
          const model = await tx.query.modelsTable.findFirst({
            where: (models, { eq }) => eq(models.id, result.modelId),
          });
          const modelName = model?.name || "Unknown Model";

          // Notifications
          // Low Credits
          if (user && Number(user.tokens) < 100) {
            await notifyLowCredits(result.userId, Number(user.tokens));
          }

          // Generation Complete
          await notifyGenerationComplete(result.userId, result.type, modelName);

          // Track Activity
          const activityTypeMap = {
            photo: "generation_photo",
            video: "generation_video",
            audio: "generation_audio",
          } as const;
          const activityType = activityTypeMap[result.type];

          if (activityType) {
            await trackActivity({
              userId: result.userId,
              activityType,
              entityId: result.generationId,
              description: `Generated ${result.type} using model "${modelName}"`,
              metadata: {
                generation_time: result.generationTime,
                model_name: modelName,
                prompt: result.prompt.substring(0, 100),
                batch_size: result.batchSize || 1,
              },
            });
          }
        }
      }

      return { success: true };
    });
  } catch (error) {
    console.error("Error processing generation result:", error);
    throw error;
  }
}

export async function processGenerationFailure(
  generationId: string,
  error: string,
  refundAmountArg?: number,
) {
  try {
    await db.transaction(async (tx) => {
      // 1. Mark as failed
      const [gen] = await tx
        .update(generateTable)
        .set({ status: "FAILED", error })
        .where(eq(generateTable.id, generationId))
        .returning();

      if (!gen) return;

      // 2. Refund tokens
      let refundAmount = 0;

      if (refundAmountArg !== undefined) {
        refundAmount = refundAmountArg;
      } else {
        // Fallback logic
        if (gen.type === "photo") {
          refundAmount = gen.itemsLength || 1;
        }
      }

      if (refundAmount > 0) {
        const [updatedUser] = await tx
          .update(usersTable)
          .set({ tokens: sql`${usersTable.tokens} + ${refundAmount}` })
          .where(eq(usersTable.id, gen.userId))
          .returning({ id: usersTable.id, tokens: usersTable.tokens });
        console.log(
          `Refunded ${refundAmount} tokens to user ${gen.userId} for failed generation ${generationId}`,
        );
      } else {
        console.warn(
          `Could not determine refund amount for generation ${generationId} (type: ${gen.type}). Manual refund may be required.`,
        );
      }
    });
  } catch (err) {
    console.error("Error handling generation failure:", err);
  }
}
