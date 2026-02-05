'use server';

import { db } from '@/db';
import { subscriptionHistoryTable, usersTable } from '@/db/schema';
import { desc, gt, sum } from 'drizzle-orm';

export const getAllUsers = async () => {
  const allUsers = await db.query.usersTable.findMany({
    orderBy: [desc(usersTable.createdAt), desc(usersTable.id)],
  });

  const tokensCount = await db
    .select({
      userId: subscriptionHistoryTable.userId,
      validTokens: sum(subscriptionHistoryTable.tokenQuantity),
    })
    .from(subscriptionHistoryTable)
    .where(gt(subscriptionHistoryTable.tokensExpireAt, new Date()))
    .groupBy(subscriptionHistoryTable.userId);

  const tokensMap = new Map(
    tokensCount.map((v) => [v.userId, Number(v.validTokens) || 0])
  );

  const allUsersData = allUsers.map((user) => ({
    ...user,
    tokens: String(user.tokens),
  }));

  return allUsersData;
};
