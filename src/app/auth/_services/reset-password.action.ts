'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokensTable, usersTable } from '@/db/schema';

const ResetPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Minimum of 6 characters required',
  }),
  token: z.string().min(1, 'Token is required'),
});

export const resetPassword = async (
  values: z.infer<typeof ResetPasswordSchema>
) => {
  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { password, token } = validatedFields.data;

  // 1. Find the token in the database
  const existingToken = await db.query.passwordResetTokensTable.findFirst({
    where: eq(passwordResetTokensTable.token, token),
  });

  if (!existingToken) {
    return { error: 'Invalid token!' };
  }

  // 2. Check if the token has expired
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token has expired!' };
  }

  // 3. Find the user associated with the token
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, existingToken.email),
  });

  if (!existingUser) {
    return { error: 'User does not exist!' };
  }

  // 4. Hash the new password and update the user's record
  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(usersTable)
    .set({
      password: hashedPassword,
    })
    .where(eq(usersTable.id, existingUser.id));

  // 5. Delete the used password reset token
  await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.id, existingToken.id));

  return { success: 'Password updated successfully!' };
};
