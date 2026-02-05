'use client';

import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  showSuccessDialog: boolean;
  handleDialogClose: () => void;
  isSubscription: boolean;
};

function SuccessPaymentDialog({
  showSuccessDialog,
  handleDialogClose,
  isSubscription,
}: Props) {
  const router = useRouter();

  return (
    <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <DialogTitle className="text-center font-semibold text-lg">
            {isSubscription ? 'Subscription Activated' : 'Payment Successful'}
          </DialogTitle>

          <DialogDescription className="text-center text-gray-600">
            {isSubscription ? (
              <>
                Your subscription is now active! You can start using your plan
                benefits immediately. Thank you for joining us.
              </>
            ) : (
              <>
                Your payment was processed successfully. The purchased credits
                have been added to your account.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col space-y-2">
          <Button
            onClick={() => {
              handleDialogClose();
              router.push('/user/dashboard'); // 👈 change to your desired redirect page
            }}
            className={cn('text-base font-semibold !normal-case shadow-lg')}
          >
            {/* TODO: */}
            {/* Go to Dashboard */}
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SuccessPaymentDialog;
