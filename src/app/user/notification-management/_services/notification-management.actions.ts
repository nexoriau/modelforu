'use server';

import { auth } from '@/app/auth/_services/auth';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

/* ------------------------------------------------------------------
   The shape of the object you are allowed to send to the DB.
   Only the boolean columns are allowed – everything else is stripped.
------------------------------------------------------------------- */
type UpdatePayload = Partial<
  Omit<
    InferInsertModel<typeof notificationPreferences>,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  >
>;

export async function updateNotificationPreferences(payload: UpdatePayload) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthenticated' };
  }

  const userId = session.user.id;

  try {
    // 1. Try to update – if no row exists, `update` returns [].
    const updated = await db
      .update(notificationPreferences)
      .set(payload)
      .where(eq(notificationPreferences.userId, userId))
      .returning({ id: notificationPreferences.id });

    // 2. If nothing was updated → create the row (first-time user)
    if (updated.length === 0) {
      await db.insert(notificationPreferences).values({
        userId,
        ...payload,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('updateNotificationPreferences error →', err);
    return { error: 'Failed to save preferences' };
  }
}
