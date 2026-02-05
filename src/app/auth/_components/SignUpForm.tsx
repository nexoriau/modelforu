'use client';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Mail, X } from 'lucide-react';
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
import { signUpSchema } from '@/db/schema/auth';
import { signUpUser } from '../_services/sign-up.action';
import OAuthButtons from './OAuthButtons';
import { useTranslation } from 'react-i18next';

type FormValues = z.infer<typeof signUpSchema>;
type AccountType = 'Personal' | 'Agency';

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700">
      <X />
      <p>{message}</p>
    </div>
  );
};

const SignUpForm = () => {
  const { t } = useTranslation();

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [accountType, setAccountType] = useState<AccountType>('Personal');

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      signUpUser({
        ...values,
        role: accountType === 'Personal' ? 'user' : 'agency',
      }).then((data) => {
        if (data.error && data.error === 'Generic Error Placeholder') {
          setError(t('signup.error.generic'));
        } else {
          setError(data.error);
        }
        setSuccess(data.success);
      });
    });
  };

  const nameLabelKey =
    accountType === 'Personal'
      ? 'signup.form.label.fullName'
      : 'signup.form.label.agencyName';

  if (success) {
    const emailValue = form.getValues('email');
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md border-none shadow-none text-center">
          <CardContent>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              {t('signup.successMessage.title')}
            </h1>
            <p className="mt-4 text-gray-600">
              {t('signup.successMessage.bodyPart1')}{' '}
              <span className="font-semibold text-gray-800">{emailValue}</span>
              {t('signup.successMessage.bodyPart2')}
            </p>
            <Button asChild className="mt-8 w-full">
              <Link href="/auth/sign-in">
                {t('signup.successMessage.backToSignIn')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-none shadow-none">
        <CardContent className="p-0">
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('signup.title')}
            </h1>
            <p className="text-sm text-gray-500 mb-8">{t('signup.subtitle')}</p>
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setAccountType('Personal')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-md transition-all ${
                accountType === 'Personal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('signup.accountType.personal')}
            </button>
            <button
              type="button"
              onClick={() => setAccountType('Agency')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-md transition-all ${
                accountType === 'Agency'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('signup.accountType.agency')}
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t(nameLabelKey)}
                    </FormLabel>
                    <FormControl>
                      <Input
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t('signup.form.label.email')}
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-semibold">
                      {t('signup.form.label.password')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
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

              <Button
                type="submit"
                className="w-full h-14 bg-black text-white hover:bg-gray-800 text-base font-semibold"
                disabled={isPending}
              >
                {isPending
                  ? t('signup.form.button.creating')
                  : t('signup.form.button.createAccount')}
              </Button>
            </form>
          </Form>

          <OAuthButtons isPending={isPending} />

          <div className="mt-6 text-center text-sm">
            {t('signup.form.footer.alreadyHaveAccount')}{' '}
            <Link
              href="/auth/sign-in"
              className="font-semibold text-black hover:underline"
            >
              {t('signup.form.footer.signInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
