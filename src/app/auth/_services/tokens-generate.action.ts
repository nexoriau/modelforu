'use server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  passwordResetTokensTable,
  usersTable,
  verificationTokensTable,
} from '@/db/schema';

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const userData = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!userData) {
    return { error: 'User not found' };
  }

  if (!userData.emailVerified) {
    return { error: 'Your Email is not verified!' };
  }

  const existingToken = await db.query.passwordResetTokensTable.findFirst({
    where: eq(passwordResetTokensTable.email, email),
  });

  if (existingToken) {
    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.id, existingToken.id));
  }

  const [passwordResetToken] = await db
    .insert(passwordResetTokensTable)
    .values({
      email,
      token,
      expires,
    })
    .returning();

  return { passwordResetToken };
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await db.query.verificationTokensTable.findFirst({
    where: eq(verificationTokensTable.identifier, email),
  });

  if (existingToken) {
    await db
      .delete(verificationTokensTable)
      .where(eq(verificationTokensTable.identifier, email));
  }

  const [verificationToken] = await db
    .insert(verificationTokensTable)
    .values({
      identifier: email,
      token,
      expires,
    })
    .returning();

  return verificationToken;
};
