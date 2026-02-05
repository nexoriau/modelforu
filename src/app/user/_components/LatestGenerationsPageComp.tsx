"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpDown,
  Search,
  Loader2,
  FileImage,
  Video,
  Mic,
  MoreHorizontal,
  Download,
  Eye,
  PenBox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns"; 
import { useTranslation } from "react-i18next";

// Shadcn UI Component Imports (Adjust paths as needed)
import { Input } from "@/components/ui/input";
import { useGetGenerationsByUserId } from "../my-models/_services/generate/generate-use-queries";
import DownloadButton from "@/components/shared/MediaDownloadButton";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  discardGeneratedImage,
  softDeleteGeneration,
} from "../my-models/_services/generate/generate.actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type SortConfig = {
  key: "type" | "createdAt" | "model";
  direction: "asc" | "desc";
};

interface FlatGalleryItem {
  id: string; // Image ID or Gen ID
  generateId: string;
  url: string;
  type: string;
  modelName: string;
  createdAt: Date;
  description: string;
  isDiscarded: boolean;
  videoIndex?: number;
}

export default function GalleryByUserId({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();
  // State for Search and Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  // State for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Approx 20 images (4 images per generation)

  const offset = (currentPage - 1) * itemsPerPage;

  const { generationsByUserIdData, generationsByUserIdLoading } =
    useGetGenerationsByUserId(userId, itemsPerPage, offset);

  const generations = generationsByUserIdData?.generations ?? [];
  const totalItems = generationsByUserIdData?.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const router = useRouter();

  // Process Data: Flatten -> Filter -> Sort
  const processedData = useMemo(() => {
    // If loading or no data, return empty
    if (!generations) return [];

    // 1. Flatten the data
    const flattened: FlatGalleryItem[] = [];

    generations.forEach((gen: any) => {
      if (gen.type === "photo") {
        gen.images.forEach((img: any) => {
          if (!img.isDiscarded) {
            flattened.push({
              id: img.id,
              generateId: gen.id,
              url: img.imageUrl,
              type: "photo",
              modelName: gen.model?.name || "Unknown",
              createdAt: new Date(img.createdAt || gen.createdAt),
              description: gen.description,
              isDiscarded: img.isDiscarded,
            });
          }
        });
      } else if (gen.type === "video" || gen.type === "audio") {
        gen.mediaUrl.forEach((url: string, index: number) => {
          flattened.push({
            id: `${gen.id}-${index}`,
            generateId: gen.id,
            url: url,
            type: gen.type,
            modelName: gen.model?.name || "Unknown",
            createdAt: new Date(gen.createdAt),
            description: gen.description,
            isDiscarded: false,
            videoIndex: index,
          });
        });
      }
    });

    // 2. Search Filter
    let filtered = flattened;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = flattened.filter(
        (item) =>
          item.modelName.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery),
      );
    }

    // 3. Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case "model":
          aValue = a.modelName;
          bValue = b.modelName;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "createdAt":
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [generations, searchQuery, sortConfig]);

  const handleDelete = async (item: FlatGalleryItem) => {
    if (item.type === "photo") {
      const res = await discardGeneratedImage(item.id);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success(t("user.gallery.dialog.moveToTrashSuccess"));
        // ✅ Invalidate both active and trash queries
        queryClient.invalidateQueries({
          queryKey: ["generations", "active", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["discarded-images", userId],
        });
        // ✅ Refetch user to update token balance in navbar
        await refetchUser();
      }
    } else {
      // For video/audio, soft delete (no refund)
      const res = await softDeleteGeneration(item.generateId);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success(t("user.gallery.dialog.moveToTrashSuccess"));
        // ✅ Invalidate both active and trash queries
        queryClient.invalidateQueries({
          queryKey: ["generations", "active", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash", userId],
        });
        // No refetch needed for videos/audio (no token change)
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("user.gallery.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("user.sidebar.gallery")}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSortConfig((curr) => ({
                ...curr,
                direction: curr.direction === "asc" ? "desc" : "asc",
              }))
            }
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortConfig.direction === "asc"
              ? t("user.gallery.sort.oldest")
              : t("user.gallery.sort.newest")}
          </Button>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t("user.gallery.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {generationsByUserIdLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{t("user.gallery.loading")}</p>
        </div>
      ) : processedData.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t("user.gallery.noItems")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {processedData.map((item) => (
            <div key={item.id} className="group flex flex-col space-y-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                {/* Media Preview */}
                {item.type === "photo" ? (
                  <ImageWithFallback
                    src={item.url}
                    alt={item.description}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-md">
                      {item.type === "video" && <Video className="w-4 h-4" />}
                      {item.type === "audio" && <Mic className="w-4 h-4" />}
                    </div>
                  </div>
                )}

                {/* Top-Right Download */}
                <div className="absolute top-2 right-2 z-10">
                  <DownloadButton
                    url={[item.url]}
                    type={item.type as any}
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm transition-all transform translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>

                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogTitle>
                        {t("user.gallery.dialog.viewMedia")}
                      </DialogTitle>
                      <div className="relative aspect-square w-full max-h-[70vh] flex items-center justify-center p-2 mb-4">
                        {item.type === "photo" ? (
                          <div className="relative w-full h-full">
                            <ImageWithFallback
                              src={item.url}
                              alt="Large preview"
                              fill
                              className="rounded-lg object-contain"
                            />
                          </div>
                        ) : (
                          <video
                            src={item.url}
                            controls
                            className="max-w-full max-h-full rounded-lg"
                          />
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">
                            {t("user.gallery.dialog.model")}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {item.modelName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">
                            {t("user.gallery.dialog.prompt")}
                          </p>
                          <p className="text-sm italic text-gray-700">
                            &quot;{item.description}&quot;
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">
                            {t("user.gallery.dialog.date")}
                          </p>
                          <p className="text-sm text-gray-700">
                            {format(item.createdAt, "MMM dd, yyyy • hh:mm a")}
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Video (If video) */}
                  {item.type === "video" && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-lg"
                      onClick={() =>
                        router.push(
                          `/user/latest-generations/${item.generateId}/edit-video?v=${encodeURIComponent(item.url)}&index=${item.videoIndex}`,
                        )
                      }
                    >
                      <PenBox className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Discard / Delete with confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all delay-75 transform scale-90 group-hover:scale-100"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {item.type === "photo"
                            ? t("user.gallery.dialog.moveToTrash")
                            : t("user.gallery.dialog.moveToTrash")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {item.type === "photo"
                            ? t("user.gallery.dialog.moveToTrashDesc", {
                                mediaType: "image",
                              })
                            : t("user.gallery.dialog.moveToTrashDesc", {
                                mediaType: item.type,
                              })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("user.gallery.dialog.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("user.gallery.dialog.confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="px-1">
                <p
                  className="text-sm text-gray-900"
                  title={`${item.modelName}: ${item.description}`}
                >
                  <span className="font-bold">{item.modelName}</span>:{" "}
                  {(item.description || "").length > 60
                    ? `${(item.description || "").slice(0, 60)}...`
                    : item.description || ""}
                </p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {format(item.createdAt, "MMM dd, yyyy • hh:mm a")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer / Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {t("user.gallery.pagination.showing")}{" "}
          {processedData.length > 0 ? 1 + offset : 0}{" "}
          {t("user.gallery.pagination.to")}{" "}
          {Math.min(offset + itemsPerPage, totalItems)}{" "}
          {t("user.gallery.pagination.of")} {totalItems}{" "}
          {t("user.gallery.pagination.items")}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || generationsByUserIdLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">
              {t("user.gallery.pagination.previousPage")}
            </span>
          </Button>

          <div className="flex items-center gap-1 text-sm font-medium">
            <span className="px-2">
              {t("user.gallery.pagination.page")} {currentPage}{" "}
              {t("user.gallery.pagination.of")} {Math.max(1, totalPages)}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || generationsByUserIdLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">
              {t("user.gallery.pagination.nextPage")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}