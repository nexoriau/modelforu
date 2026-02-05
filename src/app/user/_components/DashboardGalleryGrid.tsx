"use client";

import React, { useMemo } from "react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { format } from "date-fns";
import {
  Video,
  Mic,
  Eye,
  MoreHorizontal,
  PenBox,
  FileImage,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DownloadButton from "@/components/shared/MediaDownloadButton";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  discardGeneratedImage,
  softDeleteGeneration,
} from "../my-models/_services/generate/generate.actions";
import { GenerateWithImagesType } from "@/db/schema/generate";

interface FlatGalleryItem {
  id: string;
  generateId: string;
  url: string;
  type: string;
  modelName: string;
  createdAt: Date;
  description: string;
  isDiscarded: boolean;
  videoIndex?: number;
}

type DashboardGeneration = GenerateWithImagesType & {
  model?: { name: string | null };
};

export default function DashboardGalleryGrid({
  generations,
  userId,
}: {
  generations: DashboardGeneration[];
  userId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Process Data: Flatten -> Sort -> Limit 10
  const processedData = useMemo(() => {
    if (!generations) return [];

    // 1. Flatten the data
    const flattened: FlatGalleryItem[] = [];

    generations.forEach((gen) => {
      if (gen.type === "photo") {
        gen.images.forEach((img) => {
          if (!img.isDiscarded) {
            flattened.push({
              id: img.id,
              generateId: gen.id,
              url: img.imageUrl,
              type: "photo",
              modelName: gen.model?.name || "Unknown",
              createdAt: new Date(img.createdAt || gen.createdAt),
              description: gen.description || "",
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
            description: gen.description || "",
            isDiscarded: false,
            videoIndex: index,
          });
        });
      }
    });

    // 2. Sort by createdAt desc
    flattened.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 3. Take top 10
    return flattened.slice(0, 10);
  }, [generations]);

  const handleDelete = async (item: FlatGalleryItem) => {
    if (!userId) return;

    if (item.type === "photo") {
      const res = await discardGeneratedImage(item.id);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success("Image discarded and points refunded");
        queryClient.invalidateQueries({
          queryKey: ["generations", "active", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash", userId],
        });
        router.refresh();
      }
    } else {
      const res = await softDeleteGeneration(item.generateId);
      if (res.error) {
        toast.error(res.message);
      } else {
        toast.success("Moved to trash");
        queryClient.invalidateQueries({
          queryKey: ["generations", "active", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash", userId],
        });
        router.refresh();
      }
    }
  };

  if (processedData.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <FileImage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No recent activity found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <DialogTitle>View Media</DialogTitle>
                  {/* Dialog Content similar to gallery */}
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
                        Model
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.modelName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Prompt
                      </p>
                      <p className="text-sm italic text-gray-700">
                        &quot;{item.description}&quot;
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Date
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
                      `/user/latest-generations/${item.generateId}/edit-video?v=${encodeURIComponent(
                        item.url,
                      )}&index=${item.videoIndex}`,
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
                        ? "Discard Image?"
                        : "Delete Video?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {item.type === "photo"
                        ? "This will discard the image and refund 0.25 tokens. You can restore it later for a fee."
                        : "This will move the video to the trash bin."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirm
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
  );
}
