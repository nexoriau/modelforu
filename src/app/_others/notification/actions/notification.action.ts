'use server';

import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import {
  CreateNotificationType,
  notificationTable,
} from '@/db/schema/notification';
import { desc, eq } from 'drizzle-orm';

export const getNotification = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return [];
  }
  const res = await db.query.notificationTable.findMany({
    where: eq(notificationTable.userId, user.id),
    orderBy: [desc(notificationTable.time)],
  });

  return res;
};

export const createNotification = async (formData: CreateNotificationType) => {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return { error: true, message: 'User not found' };
    }

    const [res] = await db
      .insert(notificationTable)
      .values(formData)
      .returning();
    if (!res.id) {
      return { error: true, message: 'Notification not created' };
    }
  } catch (error) {
    console.log(error);
    return { error: true, message: 'Error while creating notification' };
  }
};

export const updateNotification = async (
  formData: Partial<CreateNotificationType>
) => {
  try {
    const { id, ...rest } = formData;

    if (!id) {
      return { error: true, message: 'User not found' };
    }
    const [res] = await db
      .update(notificationTable)
      .set(rest)
      .where(eq(notificationTable.id, id))
      .returning();
    if (!res.id) {
      return { error: true, message: 'Notification not updated' };
    }
  } catch (error) {
    console.log(error);
    return { error: true, message: 'Error while updating notification' };
  }
};
