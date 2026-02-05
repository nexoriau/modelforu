'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserTableType } from '@/db/schema/auth';
import { ModelTableType } from '@/db/schema/models';
import { updateModel } from '../_services/main-model/mainMode.actions';
import { uploadToCloudinary } from '@/lib/utils-functions/uploadToCloudinary';
import ModelForm from './ModelForm';

interface EditModelDialogProps {
  model: ModelTableType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user?: UserTableType;
}

export default function EditModelDialog({
  model,
  open,
  onOpenChange,
  onSuccess,
  user,
}: EditModelDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleSubmit = async (
    data: any,
    imageFile: File | null,
    existingImageUrl?: string
  ) => {
    if (!user?.id || !model) return;

    setIsEditing(true);
    setUploadProgress(0);

    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        finalImageUrl = await uploadToCloudinary(imageFile);
        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      await updateModel(model.id, {
        ...data,
        imageUrl: finalImageUrl,
        userId: user.id,
      });

      onOpenChange(false);
      onSuccess();
    } catch (e) {
      console.error('Failed to update model:', e);
      throw e;
    } finally {
      setIsEditing(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!model) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Model: {model.name}</DialogTitle>
          <DialogDescription>Update the model details.</DialogDescription>
        </DialogHeader>
        <ModelForm
          model={model}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isEditing}
          uploadProgress={uploadProgress}
          submitButtonText="Save Changes"
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
}
