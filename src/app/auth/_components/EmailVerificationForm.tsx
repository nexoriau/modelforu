'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, LucideLoader } from 'lucide-react';
import { emailVerification } from '../_services/email-verification.action';

export const EmailVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError('Missing verification token!');
      return;
    }

    emailVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError('Something went wrong!');
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <h1 className="text-2xl font-bold">Confirming your verification</h1>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center justify-center p-4">
            {
              !success && !error && (
                <LucideLoader className="animate-spin" />
              ) /* Or a spinner component */
            }

            {success && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
          <Button asChild variant="link" className="mt-4">
            <Link href="/auth/sign-in">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
