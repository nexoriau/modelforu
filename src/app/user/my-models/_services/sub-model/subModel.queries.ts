'use server';

import { db } from '@/db';
import { subModelTable, SubModelTableType } from '@/db/schema/sub-model';
import { and, desc, eq } from 'drizzle-orm';

export async function getSubModelById(
  id?: string
): Promise<SubModelTableType | undefined> {
  if (!id) return;
  const result = await db.query.subModelTable.findFirst({
    where: eq(subModelTable.id, id),
  });

  return result;
}

export const getAllSubModels = async () => {
  const res = await db.query.subModelTable.findMany({
    orderBy: [desc(subModelTable.createdAt)],
    with: {model:true}
  });
  return res;
};

export async function getAllSubModelsByModelId(
  modelId?: string
): Promise<SubModelTableType[]> {
  if (!modelId) return [];
  return await db
    .select()
    .from(subModelTable)
    .where(eq(subModelTable.modelId, modelId))
    .orderBy(subModelTable.createdAt)
    .limit(8);
}
export async function getAllSubModelsByUserId(
  userId?: string
): Promise<SubModelTableType[]> {
  if (!userId) return [];
  return await db
    .select()
    .from(subModelTable)
    .where(eq(subModelTable.userId, userId))
    .orderBy(subModelTable.createdAt)
    .limit(8);
}

// By Model ID
export async function getAllAudioSubModelsByModelId(
  modelId: string
): Promise<SubModelTableType[]> {
  if (!modelId) return [];
  return await db
    .select()
    .from(subModelTable)
    .where(
      and(eq(subModelTable.modelId, modelId), eq(subModelTable.type, 'audio'))
    )
    .orderBy(subModelTable.createdAt);
}

export async function getAllPhotoSubModelsByModelId(
  modelId: string
): Promise<SubModelTableType[]> {
  if (!modelId) return [];
  return await db
    .select()
    .from(subModelTable)
    .where(
      and(eq(subModelTable.modelId, modelId), eq(subModelTable.type, 'photo'))
    )
    .orderBy(subModelTable.createdAt);
}

export async function getAllVideoSubModelsByModelId(
  modelId: string
): Promise<SubModelTableType[]> {
  if (!modelId) return [];
  return await db
    .select()
    .from(subModelTable)
    .where(
      and(eq(subModelTable.modelId, modelId), eq(subModelTable.type, 'video'))
    )
    .orderBy(subModelTable.createdAt);
}

// By User ID
export async function getAllAudioSubModelsByUserId(
  userId: string
): Promise<SubModelTableType[]> {
  if (!userId) return [];
  return await db.query.subModelTable.findMany({
    where: (sub, { eq, and }) =>
      and(eq(sub.userId, userId), eq(sub.type, 'audio')),
    orderBy: (sub, { asc }) => asc(sub.createdAt),
    with: {
      model: {
        columns: { name: true },
      },
    },
  });
}

export async function getAllPhotoSubModelsByUserId(
  userId: string
): Promise<SubModelTableType[]> {
  if (!userId) return [];
  return await db.query.subModelTable.findMany({
    where: (sub, { eq, and }) =>
      and(eq(sub.userId, userId), eq(sub.type, 'photo')),
    orderBy: (sub, { asc }) => asc(sub.createdAt),
    with: {
      model: {
        columns: { name: true },
      },
    },
  });
}

export async function getAllVideoSubModelsByUserId(
  userId: string
): Promise<SubModelTableType[]> {
  if (!userId) return [];
  return await db.query.subModelTable.findMany({
    where: (sub, { eq, and }) =>
      and(eq(sub.userId, userId), eq(sub.type, 'video')),
    orderBy: (sub, { asc }) => asc(sub.createdAt),
    with: {
      model: {
        columns: { name: true },
      },
    },
  });
}
