"use client";

import { Image as ImageIcon, LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import CommonNotFound from "@/components/shared/CommonNotFound";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserTableType } from "@/db/schema/auth";
import { ModelTableType } from "@/db/schema/models";
import Image from "next/image";
import { getSingleAddedDefaultModel } from "../_services/main-model/mainModel.queries";
import { addDefaultModelToModelsToUsers } from "../_services/main-model/mainMode.actions";
import { toast } from "sonner";
import Link from "next/link";

// Update the schema to make imageUrl optional in form but validate separately
export const ModelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()),
  gender: z.string().min(1, "Gender is required"),
  imageUrl: z.string().optional(), // Made optional for form validation
});

export type ModelFormData = z.infer<typeof ModelFormSchema>;

type ModelsClientProps = {
  initialModels: ModelTableType[];
  removeBorder?: boolean;
};

// Use a type for the map to store the 'added' status for each model
type ModelAddedStatus = {
  [modelId: string]: boolean;
};

export default function DefaultModelsComp({
  initialModels,
  removeBorder,
}: ModelsClientProps) {
  const [models, setModels] = useState<ModelTableType[]>(initialModels);
  const [addedStatus, setAddedStatus] = useState<ModelAddedStatus>({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const router = useRouter();

  useEffect(() => {
    setModels(initialModels);
  }, [initialModels]);

  useEffect(() => {
    if (initialModels.length === 0) {
      setIsLoadingStatus(false);
      return;
    }

    const fetchAddedStatus = async () => {
      const statusMap: ModelAddedStatus = {};
      const promises = initialModels.map(async (model) => {
        const res = await getSingleAddedDefaultModel(model.id);
        statusMap[model.id] = res?.modelId ? true : false;
      });

      await Promise.all(promises);
      setAddedStatus(statusMap);
      setIsLoadingStatus(false);
    };

    fetchAddedStatus();
  }, [initialModels]);

  const addDefaulModel = (modelId: string) => {
    startTransition(async () => {
      const res = await addDefaultModelToModelsToUsers(modelId);
      if (res?.error) {
        toast.error(res.message);
        return;
      }
      toast.success(res?.message);
    });
  };

  const isModelAdded = (modelId: string): boolean => {
    return addedStatus[modelId] ?? false;
  };

  return (
    <Card
      className={`shadow-lg ${removeBorder && "border-transparent shadow-none!"}`}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold" suppressHydrationWarning>
          {t("user.dashboard.defaultModels.title")}
        </CardTitle>
        <Button asChild data-tour="my-models">
          <Link href={`/user/my-models`}>
            <span suppressHydrationWarning>
              {t("user.dashboard.defaultModels.viewAll")}
            </span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-500 mb-3" suppressHydrationWarning>
          {t("user.dashboard.defaultModels.description")}
        </p>

        <Separator className="mb-6" />

        {/* Display Loading state */}
        {isLoadingStatus && models.length > 0 ? (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <LucideLoader2 className="animate-spin" />
          </div>
        ) : models?.length === 0 ? (
          <CommonNotFound collection="Model" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    {model.description || "No description available"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-2 min-h-7">
                    {model.tags &&
                    Array.isArray(model.tags) &&
                    model.tags.length > 0 ? (
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
                      <span
                        className="text-xs text-gray-400 italic"
                        suppressHydrationWarning
                      >
                        {t("user.dashboard.defaultModels.noTags")}
                      </span>
                    )}
                  </div>

                  {/* Button */}
                  {/* Check the status using the helper function */}
                  {isModelAdded(model.id) ? (
                    <Button
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                      onClick={(e) => {
                        // Prevent the card's click handler from firing when clicking the button
                        e.stopPropagation();
                        router.push(`/user/my-models/${model.id}`);
                      }}
                    >
                      <span suppressHydrationWarning>
                        {t("user.dashboard.defaultModels.viewDetails")}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addDefaulModel(model.id);
                      }}
                      variant="outline"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                          <LucideLoader2 className="animate-spin" />
                          <p suppressHydrationWarning>
                            {t("user.dashboard.defaultModels.adding")}
                          </p>
                        </div>
                      ) : (
                        <span suppressHydrationWarning>
                          {t("user.dashboard.defaultModels.addModel")}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
