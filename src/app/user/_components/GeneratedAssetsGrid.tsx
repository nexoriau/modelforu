"use client";

import DownloadButton from "@/components/shared/MediaDownloadButton";
import { GenerateWithImagesType } from "@/db/schema/generate";
import Image from "next/image";
import React, { useState } from "react";
import FullPreviewModal from "./FullPreviewModal";

const GeneratedAssetsGrid = ({
  recentGenerations,
}: {
  recentGenerations: GenerateWithImagesType[];
}) => {
  const [activeBatch, setActiveBatch] = useState<GenerateWithImagesType | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const closeViewer = () => {
    setActiveBatch(null);
    setActiveIndex(0);
  };

  const getVisibleImages = (card: GenerateWithImagesType) =>
    card.images.filter((i) => !i.isDiscarded);

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentGenerations.map((card) => {
          const images = card.type === "photo" ? getVisibleImages(card) : [];

          const previewImage =
            images.length > 0 ? images[0].imageUrl : "/dummy-nature.png";

          return (
            <div
              key={card.id}
              onClick={() => {
                if (card.type === "photo" && images.length > 0) {
                  setActiveBatch(card);
                  setActiveIndex(0);
                }
              }}
              className="relative group rounded-2xl overflow-hidden aspect-3/4 cursor-pointer"
            >
              {/* IMAGE PREVIEW */}
              {card.type === "photo" && (
                <Image
                  src={previewImage}
                  alt="Generated content"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* VIDEO PREVIEW */}
              {card.type === "video" && (
                <video
                  src={card.mediaUrl[0]!}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* GRADIENT */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

              {/* COUNT BADGE */}
              {card.type === "photo" && images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {images.length} photos
                </div>
              )}

              {/* DOWNLOAD (do NOT open preview) */}
              <div
                className="absolute bottom-4 right-4"
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadButton
                  url={
                    card.type === "video"
                      ? card.mediaUrl
                      : card.images
                          .filter((val) => !val.isDiscarded)
                          .map((val) => val.imageUrl)
                  }
                  type="photo"
                  className="bg-white text-gray-700 rounded-full p-2 hover:bg-gray-100 shadow-lg"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN PREVIEW */}
      {activeBatch && (
        <FullPreviewModal
          images={getVisibleImages(activeBatch).map((i) => i.imageUrl)}
          startIndex={activeIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
};

export default GeneratedAssetsGrid;
