'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generatePasswordResetToken } from '../_services/tokens-generate.action';
import { sendPasswordResetEmail } from '../_services/auth-emails.action';
import OAuthButtons from './OAuthButtons';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

// --- FormError Component (from previous context, included for completeness) ---
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700">
      <X />
      <p>{message}</p>
    </div>
  );
};

const ForgotPasswordForm = () => {
  // 🚀 Initialize useTranslation hook
  const { t } = useTranslation();

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        const { error: tokenError, passwordResetToken } =
          await generatePasswordResetToken(values.email);

        if (tokenError) {
          setError(tokenError);
          return;
        }
        if (!passwordResetToken) {
          setError(t('forgotPassword.error.tokenGeneration'));
          return;
        }

        await sendPasswordResetEmail(
          passwordResetToken.email,
          passwordResetToken.token
        );

        setSuccess('Email sent!'); // Success message is handled visually below
      } catch (error) {
        // Using translated generic error key
        setError(t('forgotPassword.error.generic'));
      }
    });
  };

  // --- Success View (Check Email) ---
  if (success) {
    const emailValue = form.getValues('email');
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md border-none shadow-none text-center">
          <CardContent>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              {/* Email Icon SVG */}
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              {t('forgotPassword.success.title')}
            </h1>
            <p className="mt-4 text-gray-600">
              {t('forgotPassword.success.bodyPart1')}{' '}
              <span className="font-semibold text-gray-800">{emailValue}</span>
              {t('forgotPassword.success.bodyPart2')}
            </p>
            <Button
              asChild
              className="mt-8 w-full h-14 bg-black text-white hover:bg-gray-800"
            >
              <Link href="/auth/sign-in">
                {t('forgotPassword.success.backToSignIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Form View ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardContent className="p-0">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('forgotPassword.title')}
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              {t('forgotPassword.subtitle')}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t('forgotPassword.form.label.email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder=""
                        className="h-12 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <FormError message={error} />}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-black text-white hover:bg-gray-800 text-base font-semibold"
                disabled={isPending}
              >
                {isPending
                  ? t('forgotPassword.form.button.sending')
                  : t('forgotPassword.form.button.sendEmail')}
              </Button>
            </form>
          </Form>

          {/* OAuth Divider and Buttons */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('forgotPassword.orDivider')}
                </span>
              </div>
            </div>

            <OAuthButtons isPending={isPending} />
          </div>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            {t('forgotPassword.form.footer.rememberPassword')}{' '}
            <Link
              href="/auth/sign-in"
              className="font-semibold text-black hover:underline"
            >
              {t('forgotPassword.form.footer.signInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
