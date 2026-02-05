'use client';
// 🚀 Import useTranslation
import { useTranslation } from 'react-i18next';

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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SubscriptionsCardTableType } from '@/db/schema/subscription-card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteSubscriptionPricing } from '../_services/manageSubscriptionPricing.actions';
import { ManageSubscriptionPricingForm } from './ManageSubscriptionPricingForm';
import { ManageSubscriptionPricingTable } from './ManageSubscriptionPricingTable';

export function ManageSubscriptionPricingComp({
  data: subscriptions,
}: {
  data: SubscriptionsCardTableType[];
}) {
  // 🚀 Initialize translation hook
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [editData, setEditData] = useState<
    SubscriptionsCardTableType | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = (subscription: SubscriptionsCardTableType) => {
    setEditData(subscription);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteSubscriptionPricing(deleteId);
      // 🚀 Use translation key for success toast
      toast.success(t('admin.managePricing.subscription.toasts.deleteSuccess'));
      router.refresh(); // ✅ Refresh table after delete
    } catch (error) {
      // 🚀 Use translation key for error toast
      toast.error(t('admin.managePricing.subscription.toasts.deleteError'));
    } finally {
      setIsDeleting(false);
      setOpenAlert(false);
      setDeleteId(null);
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

  const handleAlertOpenChange = (val: boolean) => {
    if (isDeleting) return;
    setOpenAlert(val);
  };

  return (
    <div className="container mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {/* 🚀 Use translation key */}
          {t('admin.managePricing.subscription.header.title')}
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* 🚀 Use translation key for button text */}
            <Button onClick={() => setEditData(undefined)}>
              {t('admin.managePricing.subscription.header.addBtn')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {/* 🚀 Use translation key based on state */}
                {editData
                  ? t('admin.managePricing.subscription.dialog.editTitle')
                  : t('admin.managePricing.subscription.dialog.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <ManageSubscriptionPricingForm
              initialData={editData}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ManageSubscriptionPricingTable
        data={subscriptions}
        onEdit={handleEdit}
        onDelete={handleOpenDelete}
      />

      <AlertDialog open={openAlert} onOpenChange={handleAlertOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.subscription.deleteAlert.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.subscription.deleteAlert.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.subscription.deleteAlert.cancelBtn')}
            </AlertDialogCancel>
            <Button onClick={handleDelete} disabled={isDeleting}>
              {/* 🚀 Use translation key based on state */}
              {isDeleting
                ? t('admin.managePricing.subscription.deleteAlert.deletingBtn')
                : t('admin.managePricing.subscription.deleteAlert.deleteBtn')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
