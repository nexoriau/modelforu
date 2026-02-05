'use server';

import { sendWelcomeEmail } from '@/app/_others/email/actions/send-welcome-email.action';
import { db } from '@/db';
import { usersTable, verificationTokensTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const emailVerification = async (token: string) => {
  const existingToken = await db.query.verificationTokensTable.findFirst({
    where: eq(verificationTokensTable.token, token),
  });

  if (!existingToken) {
    return { error: 'Token does not exist!' };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token has expired!' };
  }

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, existingToken.identifier),
  });

  if (!existingUser) {
    return { error: 'Email does not exist!' };
  }

  await db
    .update(usersTable)
    .set({
      emailVerified: new Date(),
      email: existingToken.identifier, // In case user changes email before verifying
    })
    .where(eq(usersTable.id, existingUser.id));

  await db
    .delete(verificationTokensTable)
    .where(eq(verificationTokensTable.token, token));
  await sendWelcomeEmail(existingUser.email, existingUser.name ?? '');
  return { success: 'Email verified!' };
};
