"use server";
import { auth } from "@/app/auth/_services/auth";
import { db } from "@/db";
import { generateTable, notificationTable, usersTable } from "@/db/schema";
import { getUserById } from "@/lib/utils-functions/getUserById";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { trackActivity } from "@/lib/track-activity";
import {
  notifyGenerationComplete,
  notifyLowCredits,
} from "@/app/_others/notification/actions/create-notification";
import { generatedImagesTable } from "@/db/schema/generated-images";
import { generationQueue } from "@/lib/queue/queue";

type StartGenerationData = {
  description: string;
  type: "photo" | "video" | "audio";
  modelId: string;
  subModelId: string;
  batch?: number;
  // Video specific
  imageUrl?: string;
  fps?: string;
  videoLength?: number;
  quality?: string;
  character?: string;
};

export const startGeneration = async (
  formData: StartGenerationData,
): Promise<{ error: boolean; message: string; generatedDataId?: string }> => {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) {
    return { error: true, message: "Unauthorized" };
  }

  const userData = await getUserById(session.user.id);
  if (!userData) {
    return { error: true, message: "User not found" };
  }

  // 2. Calculate Token Cost
  // Logic from UsePhotoSubModelComp: batchNumber is the cost.
  // Logic from UseVideoSubModelComp: videoLength * 2 is the cost.
  let tokensReduction = 0;
  if (formData.type === "photo") {
    tokensReduction = formData.batch || 1;
  } else if (formData.type === "video") {
    tokensReduction = (formData.videoLength || 0) * 2;
  }

  if (tokensReduction <= 0) tokensReduction = 1; // Fallback safety

  if (Number(userData.tokens) < tokensReduction) {
    return {
      error: true,
      message: "Not enough tokens, please buy more tokens.",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 3. Deduct Tokens
      const [resUpdate] = await tx
        .update(usersTable)
        .set({
          tokens: sql`${usersTable.tokens} - ${tokensReduction}`,
        })
        .where(eq(usersTable.id, session.user.id))
        .returning({ id: usersTable.id, tokens: usersTable.tokens });

      if (!resUpdate?.id) {
        tx.rollback();
        return { error: true, message: "Failed to deduct tokens" };
      }

      // 4. Create Generation Record (QUEUED)
      const [resInsert] = await tx
        .insert(generateTable)
        .values({
          userId: session.user.id,
          modelId: formData.modelId,
          subModelId: formData.subModelId,
          description: formData.description,
          type: formData.type,
          itemsLength: formData.batch || 1,
          status: "QUEUED",
          mediaUrl: [], // Empty initially
        })
        .returning({ id: generateTable.id });

      if (!resInsert?.id) {
        tx.rollback();
        return { error: true, message: "Failed to create generation record" };
      }

      // 5. Add to Queue - Create individual jobs for each image in batch
      const batchSize = formData.type === "photo" ? formData.batch || 1 : 1;

      for (let i = 0; i < batchSize; i++) {
        await generationQueue.add(
          "generate",
          {
            ...formData,
            batch: 1, // Each job generates ONE image
            userId: session.user.id,
            generationId: resInsert.id,
            resolution: "1024x1024",
            imageIndex: i + 1, // Track which image this is (1-based)
            totalImages: batchSize, // Track total expected
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 5000,
            },
          },
        );
      }

      return {
        error: false,
        message: "Generation started",
        generatedDataId: resInsert.id,
      };
    });

    if (result.error) return result;

    revalidatePath("/user/generate");
    return result;
  } catch (error) {
    console.error("Start Generation Error:", error);
    return { error: true, message: "Internal Server Error" };
  }
};

// Deprecated: Old client-side generation handler
type FormData = {
  description: string;
  type: string;
  modelId: string;
  subModelId: string;
  itemsLength: number;
  mediaUrl: string[];
  batch?: number;
  generationTime: number;
};

export const createGenerate = async (
  formData: FormData,
): Promise<{ error: boolean; message: string; generatedDataId?: string }> => {
  // 1. Auth and Initial Validation
  const session = await auth();
  if (!session?.user?.id) {
    return { error: true, message: "No user or no models credits" };
  }
  const userData = await getUserById(session.user.id);
  if (!userData) {
    return { error: true, message: "User not found" };
  }
  const tokensReduction = formData.batch
    ? formData.batch
    : formData.description?.trim().length || 0;
  if (Number(userData.tokens) < tokensReduction) {
    return {
      error: true,
      message: "Not enough tokens, please buy more tokens.",
    };
  }

  try {
    // 2. Execute Transaction and capture the result
    const result = await db.transaction(async (tx) => {
      const data = {
        description: formData.description,
        type: formData.type,
        modelId: formData.modelId,
        subModelId: formData.subModelId,
        itemsLength: formData.itemsLength,
        batch: formData.batch,
        generationTime: formData.generationTime,
        mediaUrl: formData.type === "video" ? formData.mediaUrl : undefined,
      };
      // Insert the generation record
      const [resInsert] = await tx
        .insert(generateTable)
        .values({ ...data, userId: session.user.id })
        .returning({ id: generateTable.id });

      if (!resInsert?.id) {
        tx.rollback();
        return {
          error: true,
          message: "Error while inserting generation record",
        };
      }
      // separate table only for images for now
      if (data.type === "photo") {
        // 3. Insert generated images
        const [resimageInsert] = await tx
          .insert(generatedImagesTable)
          .values(
            formData.mediaUrl.map((url) => ({
              generateId: resInsert.id,
              imageUrl: url,
            })),
          )
          .returning({ id: generatedImagesTable.id });

        if (!resimageInsert?.id) {
          tx.rollback();
          return {
            error: true,
            message: "Error while inserting generation record",
          };
        }
      }

      // Update tokens atomically to prevent race conditions
      const [resUpdate] = await tx
        .update(usersTable)
        .set({
          tokens: sql`${usersTable.tokens} - ${tokensReduction}`,
        })
        .where(eq(usersTable.id, session.user.id))
        .returning({ id: usersTable.id, tokens: usersTable.tokens });

      if (!resUpdate?.id) {
        tx.rollback();
        return { error: true, message: "Error while updating user tokens" };
      }

      // Store low credits flag for notification after transaction
      const shouldNotifyLowCredits = Number(resUpdate.tokens) < 100;

      // Get model name for activity tracking
      const modelData = await tx.query.modelsTable.findFirst({
        where: (models, { eq }) => eq(models.id, formData.modelId),
      });

      // This return value is assigned to the 'result' constant above
      return {
        error: false,
        message: "Generation created",
        generatedDataId: resInsert.id,
        modelName: modelData?.name || "Unknown Model",
        shouldNotifyLowCredits,
        remainingCredits: resUpdate.tokens,
      };
    });

    // 3. Post-transaction side effects
    if (result && !result.error) {
      // Send low credits notification if needed
      if (
        result.shouldNotifyLowCredits &&
        result.remainingCredits !== undefined &&
        result.remainingCredits !== null
      ) {
        await notifyLowCredits(
          session.user.id,
          Number(result.remainingCredits),
        );
      }

      // Send generation complete notification
      if (result.modelName) {
        await notifyGenerationComplete(
          session.user.id,
          formData.type as "photo" | "video" | "audio",
          result.modelName,
        );
      }

      // Track the activity based on generation type
      const activityTypeMap = {
        photo: "generation_photo",
        video: "generation_video",
        audio: "generation_audio",
      } as const;

      const activityType =
        activityTypeMap[formData.type as keyof typeof activityTypeMap];

      if (activityType) {
        await trackActivity({
          userId: session.user.id,
          activityType,
          entityId: result.generatedDataId,
          description: `Generated ${formData.type} using model "${result.modelName}"`,
          metadata: {
            generation_time: formData.generationTime,
            tokens_used: tokensReduction,
            model_name: result.modelName,
            prompt: formData.description.substring(0, 100), // Store first 100 chars
            batch_size: formData.batch || 1,
          },
        });
      }

      revalidatePath("/user/generate");
      return {
        error: result.error,
        message: result.message,
        generatedDataId: result.generatedDataId,
      };
    }

    return (
      result || { error: true, message: "Unknown error during transaction" }
    );
  } catch (error) {
    console.error("Generation Error:", error);
    return { error: true, message: "Internal Server error while generation" };
  }
};

export const udpateGenerationsVideoUrl = async ({
  videoUrl,
  generationId,
}: {
  videoUrl: string;
  generationId: string;
}) => {
  try {
    await db
      .update(generateTable)
      .set({ mediaUrl: [videoUrl] })
      .where(eq(generateTable.id, generationId));
    revalidatePath(`/`);
    revalidatePath(`/user/latest-generations/${generationId}/edit-video`);
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: "Error while saving edited video, please try later.",
    };
  }
};

export const softDeleteGeneration = async (id: string) => {
  try {
    await db
      .update(generateTable)
      .set({ softDelete: true, softDeletedAt: new Date() })
      .where(eq(generateTable.id, id));
    return { error: false, message: "Moved to Trash" };
  } catch (error) {
    console.log(error);
    return {
      error: false,
      message: "Error occured while deleting generated item.",
    };
  }
};

export const restoreSoftDeletedGeneration = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: true, message: "Unauthorized" };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Get generation details
      const generation = await tx.query.generateTable.findFirst({
        where: eq(generateTable.id, id),
        with: { images: true },
      });

      if (!generation) {
        tx.rollback();
        return { error: true, message: "Generation not found" };
      }

      // 2. Handle token deduction for photos
      if (generation.type === "photo") {
        const discardedImages = generation.images.filter(
          (img) => img.isDiscarded,
        );
        const restoreCost = discardedImages.length * 0.5;

        if (restoreCost > 0) {
          const user = await tx.query.usersTable.findFirst({
            where: eq(usersTable.id, session.user.id),
          });

          if (!user || Number(user.tokens) < restoreCost) {
            tx.rollback();
            return {
              error: true,
              message: `Insufficient tokens. Restoring this generation costs ${restoreCost} tokens.`,
            };
          }

          // Deduct tokens
          await tx
            .update(usersTable)
            .set({
              tokens: sql`${usersTable.tokens} - ${restoreCost}`,
            })
            .where(eq(usersTable.id, session.user.id));

          // 3. Mark all images as NOT discarded
          await tx
            .update(generatedImagesTable)
            .set({ isDiscarded: false, discardedAt: null })
            .where(eq(generatedImagesTable.generateId, id));
        }
      }

      // 4. Restore the generation
      await tx
        .update(generateTable)
        .set({ softDelete: false, softDeletedAt: null })
        .where(eq(generateTable.id, id));

      return {
        error: false,
        message:
          generation.type === "photo"
            ? "Generation and images restored"
            : "Item restored",
      };
    });

    return result;
  } catch (error) {
    console.error("Error restoration:", error);
    return {
      error: true,
      message: "Error occurred while restoring item.",
    };
  }
};

// Delete all soft-deleted items for this user
export const permanentlyDeleteAllSoftDeleted = async (userId: string) => {
  try {
    // 1. Delete generations that are fully soft-deleted
    await db
      .delete(generateTable)
      .where(
        and(
          eq(generateTable.userId, userId),
          eq(generateTable.softDelete, true),
        ),
      );

    // 2. Delete individual images that are discarded (where generation is NOT soft-deleted)
    // We first find the images to delete to ensure we only target the right ones
    const imagesToDelete = await db
      .select({ id: generatedImagesTable.id })
      .from(generatedImagesTable)
      .innerJoin(
        generateTable,
        eq(generateTable.id, generatedImagesTable.generateId),
      )
      .where(
        and(
          eq(generateTable.userId, userId),
          eq(generatedImagesTable.isDiscarded, true),
          eq(generateTable.softDelete, false), // Only if generation is NOT soft deleted
        ),
      );

    if (imagesToDelete.length > 0) {
      await db
        .delete(generatedImagesTable)
        .where(
          and(
            eq(generatedImagesTable.isDiscarded, true),
            sql`${generatedImagesTable.id} IN ${imagesToDelete.map((img) => img.id)}`,
          ),
        );
    }

    revalidatePath("/user/trash");
    return { error: false, message: "Trash emptied successfully" };
  } catch (error) {
    console.error("Error permanently deleting soft-deleted items:", error);
    return {
      error: true,
      message: "Error occurred while emptying trash",
    };
  }
};

// function to delete a single item permanently
export const permanentlyDeleteGeneration = async (
  id: string,
  userId: string,
) => {
  try {
    // Check if the generation itself is soft deleted
    const generation = await db.query.generateTable.findFirst({
      where: and(eq(generateTable.id, id), eq(generateTable.userId, userId)),
      columns: { softDelete: true },
    });

    if (!generation) {
      return { error: true, message: "Item not found" };
    }

    if (generation.softDelete) {
      // If generation is soft deleted, delete the entire generation
      await db
        .delete(generateTable)
        .where(and(eq(generateTable.id, id), eq(generateTable.userId, userId)));
    } else {
      // If generation is active, ONLY delete the discarded images associated with it
      await db
        .delete(generatedImagesTable)
        .where(
          and(
            eq(generatedImagesTable.generateId, id),
            eq(generatedImagesTable.isDiscarded, true),
          ),
        );
    }

    revalidatePath("/user/trash");
    return { error: false, message: "Item permanently deleted" };
  } catch (error) {
    console.error("Error permanently deleting item:", error);
    return {
      error: true,
      message: "Error occurred while deleting item",
    };
  }
};

export const discardGeneratedImage = async (imageId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: true, message: "No user or no models credits" };
  }
  const userData = await getUserById(session.user.id);
  if (!userData) {
    return { error: true, message: "User not found" };
  }
  try {
    const result = await db.transaction(async (tx) => {
      // 1️⃣ Update the image as discarded
      const [updatedImage] = await tx
        .update(generatedImagesTable)
        .set({ isDiscarded: true, discardedAt: new Date() })
        .where(eq(generatedImagesTable.id, imageId))
        .returning({
          id: generatedImagesTable.id,
          generateId: generatedImagesTable.generateId,
        });

      if (!updatedImage?.id) {
        tx.rollback();
        return { error: true, message: "Generated image not found" };
      }

      // 2️⃣ Refund 0.25 tokens to the user
      const [updatedUser] = await tx
        .update(usersTable)
        .set({ tokens: sql`${usersTable.tokens} + 0.25` })
        .where(eq(usersTable.id, session.user.id))
        .returning({ id: usersTable.id, tokens: usersTable.tokens });

      if (!updatedUser?.id) {
        tx.rollback();
        return { error: true, message: "User not found, refund failed" };
      }

      return {
        error: false,
        message: "Image discarded and tokens refunded",
        refundedTokens: 0.25,
        newBalance: updatedUser.tokens,
      };
    });

    return result;
  } catch (error) {
    console.error("Error discarding image:", error);
    return {
      error: true,
      message: "Internal server error while discarding image",
    };
  }
};

const RESTORE_COST = 0.5;

export const restoreGeneratedImage = async (imageId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: true, message: "Unauthorized" };
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return { error: true, message: "User not found" };
  }

  if (Number(user.tokens) < RESTORE_COST) {
    return {
      error: true,
      message: "Insufficient tokens to restore image",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1️⃣ Get image details to find generateId
      const image = await tx.query.generatedImagesTable.findFirst({
        where: eq(generatedImagesTable.id, imageId),
      });

      if (!image) {
        tx.rollback();
        return { error: true, message: "Image not found" };
      }

      // 2️⃣ Restore image
      await tx
        .update(generatedImagesTable)
        .set({
          isDiscarded: false,
          discardedAt: null,
        })
        .where(eq(generatedImagesTable.id, imageId));

      // 3️⃣ Restore generation from soft delete if it was soft deleted
      await tx
        .update(generateTable)
        .set({ softDelete: false, softDeletedAt: null })
        .where(eq(generateTable.id, image.generateId));

      // 4️⃣ Deduct tokens
      const [updatedUser] = await tx
        .update(usersTable)
        .set({
          tokens: sql`${usersTable.tokens} - 0.5`,
        })
        .where(eq(usersTable.id, session.user.id))
        .returning({ tokens: usersTable.tokens });

      return {
        error: false,
        message: "Image restored successfully",
        deductedTokens: RESTORE_COST,
        newBalance: updatedUser.tokens,
      };
    });

    return result;
  } catch (err) {
    console.error("Restore image error:", err);
    return {
      error: true,
      message: "Failed to restore image",
    };
  }
};
