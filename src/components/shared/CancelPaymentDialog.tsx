'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  showCancelDialog: boolean;
  handleDialogClose: () => void;
};

function CancelPaymentDialog({ showCancelDialog, handleDialogClose }: Props) {
  const router = useRouter();

  return (
    <Dialog open={showCancelDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <DialogTitle className="text-center font-semibold text-lg">
            Payment Cancelled
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Your payment process was cancelled before completion. No charges
            were made to your account. You can return to the plans page to try
            again or choose a different option.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col space-y-2">
          <Button
            onClick={() => {
              handleDialogClose();
              router.push('/user/subscription'); // 👈 adjust to your plans page route
            }}
            className={cn('text-base font-semibold normal-case! shadow-lg')}
          >
            Back to Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CancelPaymentDialog;
