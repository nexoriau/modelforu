'use server';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { signUpSchema, usersTable } from '@/db/schema/auth';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { sendVerificationRequestEmail } from './auth-emails.action';
import { generateVerificationToken } from './tokens-generate.action';
import { hashPassword } from '@/lib/utils-functions/hashPassword';
import { notificationPreferences } from '@/db/schema';
import { CREDIT_AT_START } from '@/lib/constant';

export const signUpUser = async (
  values: z.infer<typeof signUpSchema> & { role: 'user' | 'agency' | 'admin' }
) => {
  const validatedFields = signUpSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, name } = validatedFields.data;
  const { hashedPassword } = await hashPassword(password);

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const [res] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      password: hashedPassword,
      role: values.role ?? 'user',
      tokens: String(CREDIT_AT_START),
      totalTokens: String(CREDIT_AT_START)
    })
    .returning({ id: usersTable.id });

  if (!res.id) {
    return { error: 'User not created' };
  }

  await db.insert(notificationPreferences).values({ userId: res.id });

  const verificationToken = await generateVerificationToken(email);
  const { error } = await sendVerificationRequestEmail(
    verificationToken.identifier,
    verificationToken.token
  );

  if (error) {
    return { error: error };
  }

  return {
    success:
      'A confirmation email has been sent. Please check your inbox. This link will expire in 1 hour.',
  };
};
