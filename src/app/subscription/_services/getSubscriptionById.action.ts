'use server';

import { db } from '@/db';
import { userSubscriptionsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getSubscriptionById = async (subscriptionId?: string | null) => {
  if (!subscriptionId) {
    console.log('Subscription ID not found');
    return;
  }
  const subscriptionByIdData = await db.query.userSubscriptionsTable.findFirst({
    where: eq(userSubscriptionsTable.subscriptionId, subscriptionId),
  });

  return subscriptionByIdData;
};
