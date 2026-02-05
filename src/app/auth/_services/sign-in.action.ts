'use server';
import * as z from 'zod';
import { AuthError } from 'next-auth';
import { signInSchema } from '@/db/schema/auth';
import { auth, signIn } from './auth';
import { revalidatePath } from 'next/cache';

export const signInUser = async (values: z.infer<typeof signInSchema>) => {
  const validations = signInSchema.safeParse(values);

  if (!validations.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validations.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    revalidatePath('/');
    return { success: true };

    // This part will not be reached on success due to redirect
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' };
        case 'CallbackRouteError':
          return { error: error.cause?.err?.message };
        default:
          return { error: 'Something went wrong!' };
      }
    }
    throw error;
  }
};
