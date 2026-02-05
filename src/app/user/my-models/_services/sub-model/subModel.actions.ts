'use server';
import { db } from '@/db';
import { InsertSubModelType, subModelTable } from '@/db/schema/sub-model';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
export async function createSubModel(data: InsertSubModelType) {
  const result = await db.insert(subModelTable).values(data).returning();

  if (result.length === 0) {
    throw new Error('Failed to create sub model.');
  }

  return result[0];
}

export async function updateSubModel(
  id: string,
  data: Partial<InsertSubModelType>
) {
  const result = await db
    .update(subModelTable)
    .set(data)
    .where(eq(subModelTable.id, id))
    .returning();
  revalidatePath('/admin/sub-models-requests');
  return result[0];
}

export async function deleteSubModel(id: string) {
  const result = await db
    .delete(subModelTable)
    .where(eq(subModelTable.id, id))
    .returning();

  return result[0];
}
