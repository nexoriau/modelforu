'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  showOAuthErrorDialog: boolean;
  handleDialogClose: () => void;
};

function OAuthAccountNotLinkedDialog({
  showOAuthErrorDialog,
  handleDialogClose,
}: Props) {
  const router = useRouter();

  return (
    <Dialog open={showOAuthErrorDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>

          <DialogTitle className="text-center font-semibold text-lg">
            Email Already Exists
          </DialogTitle>

          <DialogDescription className="text-center text-gray-600">
            This email is already registered with another sign-in method. Please
            sign in using your original login method (e.g., email and password)
            or contact support if you believe this is a mistake.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col space-y-2">
          <Button
            onClick={() => {
              handleDialogClose();
              router.push('/auth/sign-in');
            }}
            className={cn('text-base font-semibold !normal-case shadow-lg')}
          >
            Back to Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OAuthAccountNotLinkedDialog;
