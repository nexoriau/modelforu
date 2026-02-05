'use server';

import { db } from '@/db';
import { subscriptionHistoryTable } from '@/db/schema';
import { and, desc, eq, gte, like, lt } from 'drizzle-orm';
import moment from 'moment';

export const getTransactionsHistoryByUserId = async (userId?: string) => {
  if (!userId) return [];
  const data = await db.query.subscriptionHistoryTable.findMany({
    where: eq(subscriptionHistoryTable.userId, userId),
    orderBy: [desc(subscriptionHistoryTable.createdAt)],
  });
  return data;
};

export type TransactionsFilter = {
  invoiceId?: string;
  date?: Date | string;
  description?: string;
  amount?: string | number;
};

export const getAllTransactionsHistory = async (
  filters?: TransactionsFilter
) => {
  const whereConditions: any[] = [];

  if (filters?.invoiceId) {
    whereConditions.push(
      like(subscriptionHistoryTable.invoiceId, `%${filters.invoiceId}%`)
    );
  }

  if (filters?.date) {
    const inputDate =
      typeof filters.date === 'string' ? new Date(filters.date) : filters.date;

    if (!isNaN(inputDate.getTime())) {
      // Convert to UTC start-of-day and next UTC start-of-day (exclusive)
      const startOfDayUtc = moment(inputDate).utc().startOf('day').toDate();
      const nextDayStartUtc = moment(startOfDayUtc)
        .utc()
        .add(1, 'day')
        .toDate();

      whereConditions.push(
        gte(subscriptionHistoryTable.createdAt, startOfDayUtc)
      );
      whereConditions.push(
        lt(subscriptionHistoryTable.createdAt, nextDayStartUtc)
      );
    }
  }

  if (filters?.description && filters.description !== '') {
    whereConditions.push(
      eq(subscriptionHistoryTable.cancellationFeedback, filters.description)
    );
  }

  if (filters?.amount !== undefined && filters?.amount !== null) {
    const amount =
      typeof filters.amount === 'string'
        ? parseFloat(filters.amount)
        : Number(filters.amount);
    if (!Number.isNaN(amount)) {
      whereConditions.push(
        eq(subscriptionHistoryTable.price, amount.toString())
      );
    }
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  return await db.query.subscriptionHistoryTable.findMany({
    where: whereClause,
    orderBy: [desc(subscriptionHistoryTable.createdAt)],
  });
};
