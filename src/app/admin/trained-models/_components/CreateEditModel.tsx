"use client";
import { ModelFormData } from "@/app/user/my-models/_components/MainModelsComp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadToCloudinary } from "@/lib/utils-functions/uploadToCloudinary";
import {  useState } from "react";
import ModelForm from "@/app/user/my-models/_components/ModelForm";
import {
  useCreateTrainedModel,
  useUpdateTrainedModel,
} from "../_services/trained-models.queries";
import {
  ModelSchemaTableType
} from "../_services/admin-model.action";

const CreateEditModel = ({
  createOpen,
  setShowCreateModal,
  mode,
  model,
  currentUserId,
}: {
  setShowCreateModal: (open: any) => void;
  createOpen: boolean;
  mode: "create" | "edit";
  model?: ModelSchemaTableType;
  currentUserId: string;
}) => {
  // Loading States
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { mutateAsync: createAdminModel } = useCreateTrainedModel();
  const {mutateAsync:updateModel} = useUpdateTrainedModel()

  // --- Submission Handlers ---
  const handleCreateSubmit = async (
    data: ModelFormData,
    imageFile: File | null
  ) => {
    if (!currentUserId) return;
    console.log("Creating model with data:", data, "and imageFile:", imageFile);
    setIsCreating(true);
    setUploadProgress(0);

    try {
      let uploadedImageUrl = "";

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

        uploadedImageUrl = await uploadToCloudinary(imageFile);
        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      await createAdminModel({
        ...data,
        imageUrl: uploadedImageUrl,
        userId: currentUserId,
      });

      setShowCreateModal(false);
      // refetch();
    } catch (e) {
      console.error("Failed to create model:", e);
      throw e;
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };

  const handleEditSubmit = async (
    data: any,
    imageFile: File | null,
    existingImageUrl?: string
  ) => {
    if (!currentUserId || !model) return;
    setIsCreating(true);

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

      await updateModel({
        id: model.id,
        data: {
          ...data,
          imageUrl: finalImageUrl,
          userId: currentUserId,
        },
      });

      setShowCreateModal(null);

    } catch (e) {
      console.error("Failed to update model:", e);
      throw e;
    } finally {
      setIsCreating(true);

      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={createOpen} onOpenChange={setShowCreateModal}>
      <DialogContent className="sm:max-w-[600px]">
        <div>
          <DialogHeader>
            <DialogTitle>Create Model</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new model. All fields are
              required.
            </DialogDescription>
          </DialogHeader>
          <ModelForm
            onSubmit={mode === "create" ? handleCreateSubmit : handleEditSubmit}
            onCancel={() => setShowCreateModal(false)}
            model={mode === "edit" ? model : undefined}
            isSubmitting={isCreating}
            uploadProgress={uploadProgress}
            submitButtonText={mode === "create" ? "Create" : "Save Changes"}
            mode={mode}
            isAdmin
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditModel;
