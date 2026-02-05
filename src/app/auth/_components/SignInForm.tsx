'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signInSchema } from '@/db/schema/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { signInUser } from '../_services/sign-in.action';
import OAuthButtons from './OAuthButtons';

// --- Type Definitions ---
type FormValues = z.infer<typeof signInSchema>;

// --- Helper Component (Translates the error message) ---
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700">
      <X />
      <p>{message}</p>
    </div>
  );
};

// ====================================================================

const SignInForm = () => {
  // 🚀 Initialize useTranslation hook
  const { t } = useTranslation();

  const [error, setError] = useState<string | undefined>('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError('');

    try {
      setIsLoading(true);
      const res = await signInUser(values);
      if (res.error) {
        // If the error isn't specific, fall back to the generic translated error
        if (res.error === 'Something went wrong, please try later.') {
          setError(t('signIn.error.generic'));
        } else {
          setError(res.error);
        }
        setIsLoading(false);
        return;
      }
      // Successfully signed in
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      // Use the translated generic error message
      setError(t('signIn.error.generic'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardContent className="p-0">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('signIn.title')}
            </h1>
            <p className="text-sm text-gray-500 mb-8">{t('signIn.subtitle')}</p>
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
                      {t('signIn.form.label.email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder=""
                        className="h-12 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t('signIn.form.label.password')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder=""
                        className="h-12 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href={'/auth/forgot-password'}
                  className="text-sm hover:underline"
                >
                  {t('signIn.form.link.forgotPassword')}
                </Link>
              </div>

              {error && <FormError message={error} />}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-black text-white hover:bg-gray-800 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading
                  ? t('signIn.form.button.signingIn')
                  : t('signIn.form.button.login')}
              </Button>
            </form>
            <OAuthButtons isPending={isLoading} />
          </Form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            {t('signIn.form.footer.noAccount')}{' '}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-black hover:underline"
            >
              {t('signIn.form.footer.signUpLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
