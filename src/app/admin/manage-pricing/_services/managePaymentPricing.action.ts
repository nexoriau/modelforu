'use server';
import { db } from '@/db';
import {
  paymentCardSchema,
  paymentCardTable,
  paymentCardSchemaType,
} from '@/db/schema/payment-card';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getPaymentCards() {
  return db
    .select()
    .from(paymentCardTable)
    .orderBy(asc(paymentCardTable.createdAt));
}

export async function createPaymentCard(data: paymentCardSchemaType) {
  const validation = paymentCardSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid validations' };
  }

  await db.insert(paymentCardTable).values(validation.data);
  revalidatePath('/admin/manage-pricing');
}

export async function updatePaymentCard(
  id: string,
  data: paymentCardSchemaType
) {
  const validation = paymentCardSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid validations' };
  }

  await db
    .update(paymentCardTable)
    .set(validation.data)
    .where(eq(paymentCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}

export async function deletePaymentCard(id: string) {
  await db.delete(paymentCardTable).where(eq(paymentCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}
