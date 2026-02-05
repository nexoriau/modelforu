"use server";

import { auth } from "@/app/auth/_services/auth";
import { db } from "@/db";
import { modelsToUsersTable, usersTable } from "@/db/schema";
import { ModelSchema, ModelSchemaType, modelsTable } from "@/db/schema/models";
import { getUserById } from "@/lib/utils-functions/getUserById";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { trackActivity } from "@/lib/track-activity";
import { notifyModelCreated } from "@/app/_others/notification/actions/create-notification";

export async function createModel(data: ModelSchemaType) {
  const session = await auth();
  if (!session?.user || !session.user.models || session.user.models < 1) {
    throw new Error("No user or no models credits");
  }
  const validated = ModelSchema.parse(data);

  let createdModelId: string | undefined;

  await db.transaction(async (tx) => {
    const [res] = await tx.insert(modelsTable).values(validated).returning();
    createdModelId = res.id;

    if (res.id) {
      const [resModelToUser] = await tx
        .insert(modelsToUsersTable)
        .values({ modelId: res.id, userId: data.userId })
        .returning();

      await tx
        .update(usersTable)
        .set({ models: sql`${usersTable.models} - 1` })
        .where(eq(usersTable.id, data.userId));
    }
  });

  // Track activity
  if (createdModelId) {
    await Promise.all([
      trackActivity({
        userId: data.userId,
        activityType: "model_created",
        entityId: createdModelId,
        description: `Created model "${validated.name}"`,
        metadata: {
          model_name: validated.name,
          gender: validated.gender,
          tags: validated.tags,
        },
      }),
      notifyModelCreated(data.userId, validated.name),
    ]);
  }
  revalidatePath("/user/my-models");
}

export async function updateModel(id: string, data: ModelSchemaType) {
  const validated = ModelSchema.parse(data);
  await db.update(modelsTable).set(validated).where(eq(modelsTable.id, id));
  revalidatePath(`/user/my-models/${id}`);
}

export async function deleteModel(id: string) {
  await db.delete(modelsTable).where(eq(modelsTable.id, id));
  revalidatePath(`/user/my-models/${id}`);
}

export const addDefaultModelToModelsToUsers = async (modelId: string) => {
  const session = await auth();
  const user = session?.user;
  if (!modelId || !user?.id) {
    return {
      error: true,
      message: "ModelId or UserId not found",
    };
  }
  const userData = await getUserById(user?.id);

  if (!userData?.id) {
    return {
      error: true,
      message: "User not found",
    };
  }

  if (!userData?.models || userData.models < 1) {
    return {
      error: true,
      message: "Not enough model-tokens, Please buy them.",
    };
  }

  try {
    let modelData: any = null;

    const transaction = await db.transaction(async (tx) => {
      const [resModelToUser] = await tx
        .insert(modelsToUsersTable)
        .values({ modelId, userId: user.id })
        .returning();

      if (resModelToUser.modelId) {
        const [resUserTable] = await tx
          .update(usersTable)
          .set({ models: sql`${usersTable.models}-${1}` })
          .returning();

        // Get model details for tracking
        modelData = await tx.query.modelsTable.findFirst({
          where: eq(modelsTable.id, modelId),
        });

        if (resUserTable.id) {
          return { error: false, message: "Default model added." };
        }
      } else {
        tx.rollback();
        return {
          error: true,
          message: "Error occurs while adding default model.",
        };
      }
    });

    // Track activity after successful transaction
    if (!transaction?.error && modelData) {
      await Promise.all([
        trackActivity({
          userId: user.id,
          activityType: "model_added",
          entityId: modelId,
          description: `Added model "${modelData.name}" to my list`,
          metadata: {
            model_name: modelData.name,
          },
        }),
        notifyModelCreated(user.id, modelData.name),
      ]);
    }

    revalidatePath("/user/dashboard");
    return { error: transaction?.error, message: transaction?.message };
  } catch (error) {
    return {
      error: true,
      message: "Internal Server Error occurs while adding default model.",
    };
  }
};
