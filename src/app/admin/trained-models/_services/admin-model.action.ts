"use server";

import { auth } from "@/app/auth/_services/auth";
import { db } from "@/db";
import { modelsToUsersTable } from "@/db/schema";
import {  ModelSchemaType, modelsTable, ModelTableType } from "@/db/schema/models";
import { subModelTable, SubModelTableType } from "@/db/schema/sub-model";
import { and, eq, inArray, sql } from "drizzle-orm";

export interface ModelSubModelSchemaType extends ModelSchemaType  {
  subModels?: {
      photo?: { enabled: boolean };
      video?: { enabled: boolean };
      audio?: { enabled: boolean };
    };
}

export interface ModelSubModelTableType extends ModelTableType  {
  subModels?: SubModelTableType[]
}

export interface ModelSchemaTableType extends ModelTableType  {
  subModels?: {
      photo?: { enabled: boolean };
      video?: { enabled: boolean };
      audio?: { enabled: boolean };
    };
}


export async function createAdminModel(
  data: ModelSubModelSchemaType
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // -----------------------------
  // Extract subModels safely
  // -----------------------------
  const { subModels, ...modelData } = data;

  // modelData.userId = session.user.id;
  modelData.isPublishedByAdmin = true;
  modelData.isDefaultModel = true;

  let createdModelId!: string;

  // -----------------------------
  // Transaction
  // -----------------------------
  await db.transaction(async (tx) => {
    // 1️⃣ Create model
    const [model] = await tx.insert(modelsTable).values(modelData).returning();

    createdModelId = model.id;

    // 2️⃣ Create sub-models
    if (subModels) {
      const inserts = Object.entries(subModels).map(([type, config]) => ({
        userId: modelData.userId,
        modelId: createdModelId,
        type: type as "photo" | "video" | "audio",
        isByAdmin: true,
        status: config.enabled
          ? "cloned"
          : ("pending" as
              | "cloned"
              | "cloning"
              | "canceled"
              | "pending"
              | "idle"),
        itemsLength: 1,
        description:modelData.description
      }));

      if (inserts.length > 0) {
        await tx.insert(subModelTable).values(inserts);
      }
    }
  });
  return { success: true, modelId: createdModelId };
}

export async function fetchModels() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const models = await db.query.modelsTable.findMany({
    with: {
      subModels: true,
      user:true
    },
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  return models;
}

export async function updateModel(
  id: string,
  data: ModelSubModelSchemaType
) {
  // const validated = ModelSchema.parse(data);

  const { subModels, ...modelData } = data;

  await db.transaction(async (tx) => {
    // 1️⃣ Update main model (NO submodels here)
    await tx
      .update(modelsTable)
      .set(modelData)
      .where(eq(modelsTable.id, id));

    // 2️⃣ Update ONLY status of existing submodels
    if (!subModels) return;

    for (const [type, config] of Object.entries(subModels)) {
      await tx
        .update(subModelTable)
        .set({
          status: config.enabled ? "cloned" : "idle",
        })
        .where(
          and(
            eq(subModelTable.modelId, id),
            eq(subModelTable.type, type as "photo" | "video" | "audio")
          )
        );
    }
  });
  return { success: true, };

}

export const deleteModel = async (id: string) => {
  await db.delete(modelsTable).where(eq(modelsTable.id, id));
};

export const assignModelToUsers = async (
  modelId: string,
  userIds: string[]
) => {
  // 1️⃣ Get existing assignments
  const existing = await db
    .select({ userId: modelsToUsersTable.userId })
    .from(modelsToUsersTable)
    .where(eq(modelsToUsersTable.modelId, modelId));

  const existingUserIds = existing.map((r) => r.userId);

  // 2️⃣ Compute diff
  const usersToAdd = userIds.filter(
    (id) => !existingUserIds.includes(id)
  );

  const usersToRemove = existingUserIds.filter(
    (id) => !userIds.includes(id)
  );

  // 3️⃣ Insert new assignments
  if (usersToAdd.length > 0) {
    await db
      .insert(modelsToUsersTable)
      .values(
        usersToAdd.map((userId) => ({
          userId,
          modelId,
        }))
      )
      .onConflictDoNothing(); // 🔥 prevents duplicate error
  }

  // 4️⃣ Remove unassigned users
  if (usersToRemove.length > 0) {
    await db
      .delete(modelsToUsersTable)
      .where(
        and(
          eq(modelsToUsersTable.modelId, modelId),
          inArray(modelsToUsersTable.userId, usersToRemove)
        )
      );
  }
};


export const fetchModelAssignments = async (modelId: string) => {
  const assignments = await db
    .select()
    .from(modelsToUsersTable)
    .where(eq(modelsToUsersTable.modelId, modelId));

  return assignments;
};  

export async function updateModelVisibility({
  modelId,
  isVisibleToAllUsers,
}: {
  modelId: string;
  isVisibleToAllUsers: boolean;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.role!=='admin') {
    throw new Error("Unauthorized: Only admin can update model visibility");
  }

  const [updatedModel] = await db
    .update(modelsTable)
    .set({
      isVisibleToAllUsers,
    })
    .where(eq(modelsTable.id, modelId))
    .returning();

  if (!updatedModel) {
    throw new Error("Model not found");
  }

  return updatedModel;
}
