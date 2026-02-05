'use server';
import { db } from '@/db';
import {
  modelCardSchema,
  modelCardSchemaType,
  modelCardTable,
} from '@/db/schema/model-card';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getModelCards() {
  return db
    .select()
    .from(modelCardTable)
    .orderBy(asc(modelCardTable.createdAt));
}

export async function createModelCard(data: modelCardSchemaType) {
  const validation = modelCardSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid validations' };
  }

  await db.insert(modelCardTable).values(validation.data);
  revalidatePath('/admin/manage-pricing');
}

export async function updateModelCard(id: string, data: modelCardSchemaType) {
  const validation = modelCardSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid validations' };
  }

  await db
    .update(modelCardTable)
    .set(validation.data)
    .where(eq(modelCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}

export async function deleteModelCard(id: string) {
  await db.delete(modelCardTable).where(eq(modelCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}
