'use server';

import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { generateTable, modelsTable, modelsToUsersTable } from '@/db/schema';
import { and, asc, count, eq } from 'drizzle-orm';

// Models By UserId
export const getModelsByUserId = async (userId?: string) => {
  if (!userId) return [];
  return await db.query.modelsTable.findMany({
    where: eq(modelsTable.userId, userId),
    orderBy: [asc(modelsTable.createdAt)],
  });
};

// Default Models
export const getDefaultModels = async () => {
  return await db.query.modelsTable.findMany({
    where: and(
      eq(modelsTable.isDefaultModel, true),
      eq(modelsTable.isPublishedByAdmin, true),
      eq(modelsTable.isVisibleToAllUsers,true)
    ),
    orderBy: [asc(modelsTable.createdAt)],
  });
};

// Model By Id
export const getModelById = async (modelId?: string) => {
  if (!modelId) return undefined;
  return await db.query.modelsTable.findFirst({
    where: eq(modelsTable.id, modelId),
  });
};

// Model generations count
export const getModelGenerationCount = async (modelId: string) => {
  try {
    const result = await db
      .select({ count: count() })
      .from(generateTable)
      .where(eq(generateTable.modelId, modelId))
      .execute();
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error fetching generation count:', error);
    return 0;
  }
};

// Single Added Default Model
export const getSingleAddedDefaultModel = async (modelId: string) => {
  const session = await auth();
  const user = session?.user;
  if (!modelId || !user?.id) {
    console.log('ModelId OR UserId not found');
    return undefined;
  }

  const res = await db.query.modelsToUsersTable.findFirst({
    where: and(
      eq(modelsToUsersTable.userId, user.id),
      eq(modelsToUsersTable.modelId, modelId)
    ),
  });

  return res;
};

export const getAllAddedDefaultModels = async () => {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    console.log('ModelId OR UserId not found');
    return undefined;
  }

  const res = await db.query.modelsToUsersTable.findMany({
    where: eq(modelsToUsersTable.userId, user.id),
    with: { model: true },
  });

  return res;
};
