'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, CheckCircle } from 'lucide-react';
import { resetPassword } from '../_services/reset-password.action';

const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof ResetPasswordSchema>;

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token!');
      return;
    }

    startTransition(() => {
      resetPassword({ password: values.password, token }).then((data) => {
        setError(data.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h1 className="text-center text-2xl font-bold tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-center text-sm text-gray-500">
            Enter a new password below.
          </p>
        </CardHeader>
        <CardContent>
          {!success && !error && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type="password"
                          className="h-12 bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full h-12 bg-black text-white hover:bg-gray-800"
                >
                  {isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          )}

          {success && <FormSuccess message={success} />}
          {error && !success && <FormError message={error} />}

          <Button
            asChild
            variant="link"
            className="mt-4 w-full text-center"
            size="sm"
          >
            <Link href="/auth/sign-in">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-700">
      <X className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

const FormSuccess = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="bg-green-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-700">
      <CheckCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};

export default ResetPasswordForm;
