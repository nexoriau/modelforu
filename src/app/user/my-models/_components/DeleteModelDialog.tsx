'use client';

import { useState } from 'react';
import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ModelTableType } from '@/db/schema/models';
import { deleteModel } from '../_services/main-model/mainMode.actions';

interface DeleteModelDialogProps {
  model: ModelTableType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteModelDialog({
  model,
  open,
  onOpenChange,
  onSuccess,
}: DeleteModelDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!model) return;

    setIsDeleting(true);
    try {
      await deleteModel(model.id);
      onOpenChange(false);
      onSuccess();
    } catch (e) {
      console.error('Failed to delete model:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!model) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{' '}
            <strong>{model.name}</strong> and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            variant={'destructive'}
            disabled={isDeleting}
            className="min-w-20"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
