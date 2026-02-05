"use client";

import React from "react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GenerateImageTableType } from "@/db/schema/generated-images";
import { RestoreImageAlert } from "./RestoreImageAlert";
import { useGetDiscardedImages } from "../my-models/_services/generate/generate-use-queries";
import { useTranslation } from "react-i18next";

export function DiscardedImagesGrid({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const {
    data: images = [],
    isLoading,
    refetch: onRestored,
  } = useGetDiscardedImages(userId);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!images.length) {
    return (
      <p className="text-sm text-gray-500 text-center">
        {t("user.discarded.noItems")}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((item: any) => (
          <div
            key={item.id}
            className="relative group border rounded-lg overflow-hidden bg-gray-50"
          >
            {/* Media Preview */}
            {item.type === "photo" ? (
              <ImageWithFallback
                src={item.imageUrl}
                alt="Discarded image"
                width={300}
                height={300}
                className="object-cover aspect-square opacity-60"
              />
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center opacity-60">
                <video
                  src={item.imageUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Red Diagonal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <span className="text-red-500/50 text-2xl md:text-3xl font-black select-none uppercase tracking-widest transform -rotate-45 whitespace-nowrap border-4 border-red-500/30 px-4 py-2">
                {t("user.discarded.watermark")}
              </span>
            </div>

            {/* Overlay with Restore Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedItem(item)}
                className="gap-2 shadow-xl border border-white/20"
              >
                <RotateCcw className="w-4 h-4" />
                {t("user.discarded.restore")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Restore Confirmation */}
      {selectedItem && (
        <RestoreImageAlert
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={() => {
            setSelectedItem(null);
            onRestored?.();
          }}
        />
      )}
    </>
  );
}