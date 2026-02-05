'use server';

import { db } from '@/db';
import {
  SubscriptionCardSchemaType,
  subscriptionCardTableSchema,
  subscriptionsCardTable,
} from '@/db/schema/subscription-card';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSubscriptionsPricing() {
  return db.query.subscriptionsCardTable.findMany({
    orderBy: [asc(subscriptionsCardTable.createdAt)],
  });
}

export async function createSubscriptionPricing(
  data: SubscriptionCardSchemaType
) {
  const validations = subscriptionCardTableSchema.safeParse(data);
  if (!validations.success) {
    return { error: 'Validations failed' };
  }
  await db.insert(subscriptionsCardTable).values({
    ...validations.data,
    monthlyPrice: validations.data.monthlyPrice.toString(),
    annualPrice: validations.data.annualPrice.toString(),
  });
  revalidatePath('/admin/manage-pricing');
}

export async function updateSubscriptionPricing(
  id: string,
  data: SubscriptionCardSchemaType
) {
  const validations = subscriptionCardTableSchema.safeParse(data);
  if (!validations.success) {
    return { error: 'Validations failed' };
  }
  await db
    .update(subscriptionsCardTable)
    .set({
      ...validations.data,
      monthlyPrice: validations.data.monthlyPrice.toString(),
      annualPrice: validations.data.annualPrice.toString(),
    })
    .where(eq(subscriptionsCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}

export async function deleteSubscriptionPricing(id: string) {
  await db
    .delete(subscriptionsCardTable)
    .where(eq(subscriptionsCardTable.id, id));
  revalidatePath('/admin/manage-pricing');
}
