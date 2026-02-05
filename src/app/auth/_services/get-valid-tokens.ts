import { db } from '@/db';
import { subscriptionHistoryTable } from '@/db/schema';
import { and, eq, gt, sum } from 'drizzle-orm';

export const getValidTokens = async (userId: string) => {
  const [res] = await db
    .select({ totalValidTokens: sum(subscriptionHistoryTable.tokenQuantity) })
    .from(subscriptionHistoryTable)
    .where(
      and(
        eq(subscriptionHistoryTable.userId, userId),
        gt(subscriptionHistoryTable.tokensExpireAt, new Date())
      )
    );
  const validTokens = Number(res.totalValidTokens || '0');
  return { error: false, message: 'Valid Tokens', validTokens };
};
