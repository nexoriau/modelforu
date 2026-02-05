"use server";

import { db } from "@/db";
import { generatedImagesTable, generateTable, modelsTable } from "@/db/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";

export const getGenerationsByModelId = async (modelId: string) => {
  try {
    const res = await db.query.generateTable.findMany({
      where: eq(generateTable.modelId, modelId),
      with: { model: { columns: { name: true } } },
    });
    return res ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getGenerationsById = async (id: string) => {
  try {
    const res = await db.query.generateTable.findFirst({
      where: eq(generateTable.id, id),
      with: { model: { columns: { name: true } }, images: true },
    });
    return res;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
export const getGenerationsByModelIdAndUserId = async (
  modelId: string,
  userId?: string,
) => {
  if (!userId) {
    console.log("User ID");
    return;
  }
  try {
    const res = await db.query.generateTable.findMany({
      where: and(
        eq(generateTable.modelId, modelId),
        eq(generateTable.userId, userId),
      ),
      with: { model: { columns: { name: true } }, images: true },
    });
    return res ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
export const getGenerationsByUserId = async (
  userId?: string,
  limit: number = 20,
  offset: number = 0,
) => {
  if (!userId) {
    console.log("User not found in generations by user ID");
    return { generations: [], total: 0 };
  }
  try {
    // 1. Get data with limit/offset
    const dataPromise = db.query.generateTable.findMany({
      where: and(
        eq(generateTable.userId, userId),
        eq(generateTable.softDelete, false),
      ),
      with: {
        model: { columns: { name: true } },
        subModel: true,
        images: true,
      },
      limit: limit,
      offset: offset,
      orderBy: [desc(generateTable.createdAt)],
    });

    // 2. Get total count
    // Using select count via sql or drizzle helper
    const countPromise = db
      .select({ count: sql<number>`count(*)` })
      .from(generateTable)
      .where(
        and(
          eq(generateTable.userId, userId),
          eq(generateTable.softDelete, false),
        ),
      );

    const [res, countRes] = await Promise.all([dataPromise, countPromise]);

    return {
      generations: res ?? [],
      total: Number(countRes[0]?.count) || 0,
    };
  } catch (error) {
    console.log(error);
    return { generations: [], total: 0 };
  }
};
export const getSoftDeletedGenerationsByUserId = async (userId?: string) => {
  console.log("Fetching trash items for userId:", userId);
  if (!userId) return [];
  try {
    const res = await db.query.generateTable.findMany({
      where: (gen, { or, eq, exists, and }) =>
        and(
          eq(gen.userId, userId),
          or(
            eq(gen.softDelete, true),
            exists(
              db
                .select()
                .from(generatedImagesTable)
                .where(
                  and(
                    eq(generatedImagesTable.generateId, gen.id),
                    eq(generatedImagesTable.isDiscarded, true),
                  ),
                ),
            ),
          ),
        ),
      with: {
        model: { columns: { name: true } },
        subModel: true,
        images: true,
      },
      orderBy: [desc(generateTable.createdAt)],
    });
    console.log(`Found ${res.length} trash items for user ${userId}`);
    return res ?? [];
  } catch (error) {
    console.error("Error in getSoftDeletedGenerationsByUserId:", error);
    return [];
  }
};

export const getDiscardedImagesByUser = async (userId: string) => {
  console.log("Fetching discarded media for userId:", userId);
  try {
    const discardedImages = await db
      .select({
        id: generatedImagesTable.id,
        imageUrl: generatedImagesTable.imageUrl,
        type: sql<string>`'photo'`,
        generateId: generateTable.id,
        discardedAt: generatedImagesTable.discardedAt,
        modelName: modelsTable.name,
      })
      .from(generatedImagesTable)
      .innerJoin(
        generateTable,
        eq(generateTable.id, generatedImagesTable.generateId),
      )
      .leftJoin(modelsTable, eq(modelsTable.id, generateTable.modelId))
      .where(
        and(
          eq(generatedImagesTable.isDiscarded, true),
          eq(generateTable.userId, userId),
        ),
      );

    const softDeletedVideos = await db
      .select({
        id: generateTable.id,
        imageUrl: sql<string>`${generateTable.mediaUrl}[1]`,
        type: generateTable.type,
        generateId: generateTable.id,
        discardedAt: generateTable.softDeletedAt,
        modelName: modelsTable.name,
      })
      .from(generateTable)
      .leftJoin(modelsTable, eq(modelsTable.id, generateTable.modelId))
      .where(
        and(
          eq(generateTable.userId, userId),
          eq(generateTable.softDelete, true),
          sql`(${generateTable.type} = 'video' OR ${generateTable.type} = 'audio')`,
        ),
      );

    const combined = [
      ...discardedImages.map((item) => ({ ...item, isImage: true })),
      ...softDeletedVideos.map((item) => ({ ...item, isImage: false })),
    ].sort(
      (a, b) =>
        new Date(b.discardedAt || 0).getTime() -
        new Date(a.discardedAt || 0).getTime(),
    );

    console.log(`Found ${combined.length} discarded items for user ${userId}`);
    return combined;
  } catch (error) {
    console.error("Error in getDiscardedImagesByUser:", error);
    return [];
  }
};