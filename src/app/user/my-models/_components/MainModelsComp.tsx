"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Image as ImageIcon, Edit, Trash } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import CommonNotFound from "@/components/shared/CommonNotFound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserTableType } from "@/db/schema/auth";
import { ModelTableType } from "@/db/schema/models";
import Image from "next/image";
import { createModel } from "../_services/main-model/mainMode.actions";
import { uploadToCloudinary } from "@/lib/utils-functions/uploadToCloudinary";
import ModelForm from "./ModelForm";
import DeleteModelDialog from "./DeleteModelDialog";
import EditModelDialog from "./EditModelDialog";

export const AdminSubModelSchema = z.object({
  enabled: z.boolean(),
});

// Update the schema to make imageUrl optional in form but validate separately
export const ModelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()),
  gender: z.string().min(1, "Gender is required"),
  imageUrl: z.string().optional(), // Made optional for form validation
  subModels: z
    .object({
      photo: AdminSubModelSchema,
      video: AdminSubModelSchema,
      audio: AdminSubModelSchema,
    })
    .optional(),
  character: z.string().optional(),
});

// export type ModelFormData = z.infer<typeof ModelFormSchema>;
export type SubModelType = "photo" | "video" | "audio";

export interface AdminSubModelForm {
  enabled: boolean;
}

export interface ModelFormData {
  name: string;
  description: string;
  tags: string[];
  gender: string;
  imageUrl?: string;
  // 👇 admin only
  subModels?: Record<SubModelType, AdminSubModelForm>;
  character?: string;
}

type ModelsClientProps = {
  initialModels: ModelTableType[];
  user?: UserTableType;
};

export default function MainModelsComp({
  initialModels,
  user,
}: ModelsClientProps) {
  const { t } = useTranslation();
  const [models, setModels] = useState<ModelTableType[]>(initialModels);
  const [createOpen, setCreateOpen] = useState(false);

  // Loading States
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const router = useRouter();

  // --- Effects ---
  useEffect(() => {
    setModels(initialModels);
  }, [initialModels]);

  // --- Submission Handlers ---
  const handleCreateSubmit = async (
    data: ModelFormData,
    imageFile: File | null,
  ) => {
    if (!user?.id) return;

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

      await createModel({
        ...data,
        imageUrl: uploadedImageUrl,
        userId: user.id,
      });

      setCreateOpen(false);
      router.refresh();
    } catch (e) {
      console.error("Failed to create model:", e);
      throw e;
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };

  const handleCreateCancel = () => {
    setCreateOpen(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          {t("user.myModels.title")}
        </CardTitle>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button disabled={isCreating}>
              {t("user.myModels.createButton")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {user?.models ? (
              <div>
                <DialogHeader>
                  <DialogTitle>
                    {t("user.myModels.createDialog.title")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("user.myModels.createDialog.description")}
                  </DialogDescription>
                </DialogHeader>
                <ModelForm
                  onSubmit={handleCreateSubmit}
                  onCancel={handleCreateCancel}
                  isSubmitting={isCreating}
                  uploadProgress={uploadProgress}
                  submitButtonText="Create"
                  mode="create"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="flex items-center justify-center size-28 rounded-full bg-muted mb-4">
                  <HandCoins size={70} className="text-yellow-500" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-lg font-semibold">
                    {t("user.myModels.noCredits.title")}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {t("user.myModels.noCredits.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6">
                  <Button onClick={() => router.push("/user/subscription")}>
                    {t("user.myModels.noCredits.button")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-500 mb-3">
          {t("user.myModels.description")}
        </p>

        <Separator className="mb-6" />

        {models.length === 0 ? (
          <CommonNotFound collection="Model" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
            {models.map((model) => (
              <div
                key={model.id}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => router.push(`/user/my-models/${model.id}`)}
              >
                {/* Image Section */}
                <div className="relative w-full h-36 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {model.imageUrl ? (
                    <Image
                      src={model.imageUrl}
                      alt={model.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageIcon size={48} strokeWidth={1.5} />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Gender Badge - Positioned on image */}
                  {model.gender && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 text-xs bg-white/90 backdrop-blur-sm border-gray-200"
                    >
                      {model.gender}
                    </Badge>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {model.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 grow">
                    {model.description || t("user.myModels.noDescription")}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2 min-h-7">
                    {model.tags && model.tags.length > 0 ? (
                      <>
                        {model.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs px-2.5 py-0.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {model.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            +{model.tags.length - 3}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        {t("user.myModels.noTags")}
                      </span>
                    )}
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/user/my-models/${model.id}`);
                    }}
                  >
                    {t("user.myModels.viewDetails")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
