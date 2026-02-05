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
import { ModelCardTableType } from '@/db/schema/model-card';
import { deleteModelCard } from '../_services/manageModelPricing.action';
import { toast } from 'sonner';
import { ModelCardForm } from './ManageModelPricingForm';
import { ModelCardTable } from './ManageModelPricingTable';

export function ManageModelPricingComp({
  data: modelCards,
}: {
  data: ModelCardTableType[];
}) {
  // 🚀 Initialize translation hook
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<ModelCardTableType | undefined>(
    undefined
  );
  const [openAlert, setOpenAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = (modelCard: ModelCardTableType) => {
    setEditData(modelCard);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        setIsDeleting(true);
        await deleteModelCard(deleteId);
        // 🚀 Use translation key for success toast
        toast.success(t('admin.managePricing.models.toasts.deleteSuccess'));
        router.refresh();
      } catch (error) {
        // 🚀 Use translation key for error toast
        toast.error(t('admin.managePricing.models.toasts.deleteError'));
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
          {t('admin.managePricing.models.header.title')}
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* 🚀 Use translation key for button text */}
            <Button onClick={() => setEditData(undefined)}>
              {t('admin.managePricing.models.header.addBtn')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {/* 🚀 Use translation key based on state */}
                {editData
                  ? t('admin.managePricing.models.dialog.editTitle')
                  : t('admin.managePricing.models.dialog.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <ModelCardForm initialData={editData} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>
      <ModelCardTable
        data={modelCards}
        onEdit={handleEdit}
        onDelete={handleOpenDelete}
      />
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.models.deleteAlert.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.models.deleteAlert.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {/* 🚀 Use translation key */}
              {t('admin.managePricing.models.deleteAlert.cancelBtn')}
            </AlertDialogCancel>
            <Button onClick={handleDelete} disabled={isDeleting}>
              {/* 🚀 Use translation key based on state */}
              {isDeleting
                ? t('admin.managePricing.models.deleteAlert.deletingBtn')
                : t('admin.managePricing.models.deleteAlert.deleteBtn')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
