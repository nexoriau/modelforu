'use client';
// 🚀 Import useTranslation
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PaymentCardTableType } from '@/db/schema/payment-card';
import { deletePaymentCard } from '../_services/managePaymentPricing.action';
import { PaymentCardForm } from './ManagePaymentPricingForm';
import { PaymentCardTable } from './ManagePaymentPricingTable';
import { toast } from 'sonner';

export function ManagePaymentPricingComp({
  data: paymentCards,
}: {
  data: PaymentCardTableType[];
}) {
  // 🚀 Initialize translation hook
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<PaymentCardTableType | undefined>(
    undefined
  );
  const [openAlert, setOpenAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = (paymentCard: PaymentCardTableType) => {
    setEditData(paymentCard);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        setIsDeleting(true);
        await deletePaymentCard(deleteId);
        // 🚀 Use translation key for success toast
        toast.success(t('admin.managePricing.tokens.toasts.deleteSuccess'));
        router.refresh();
      } catch (error) {
        // 🚀 Use translation key for error toast
        toast.error(t('admin.managePricing.tokens.toasts.deleteError'));
      } finally {
        setIsDeleting(false);
        setOpenAlert(false);
        setDeleteId(null);
      }
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setOpenAlert(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(undefined);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {/* 🚀 Use translation key */}
          {t('admin.managePricing.tokens.header.title')}
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* 🚀 Use translation key for button text */}
            <Button onClick={() => setEditData(undefined)}>
              {t('admin.managePricing.tokens.header.addBtn')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {/* 🚀 Use translation key based on state */}
                {editData
                  ? t('admin.managePricing.tokens.dialog.editTitle')
                  : t('admin.managePricing.tokens.dialog.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <PaymentCardForm initialData={editData} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>
      <PaymentCardTable
        data={paymentCards}
        onEdit={handleEdit}
        onDelete={handleOpenDelete}
      />
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.tokens.deleteAlert.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.tokens.deleteAlert.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.tokens.deleteAlert.cancelBtn')}
            </AlertDialogCancel>
            <Button onClick={handleDelete} disabled={isDeleting}>
              {/* 🚀 Use translation key based on state */}
              {isDeleting
                ? t('admin.managePricing.tokens.deleteAlert.deletingBtn')
                : t('admin.managePricing.tokens.deleteAlert.deleteBtn')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
