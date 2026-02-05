"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  images: string[];
  startIndex?: number;
  onClose: () => void;
};

export default function FullPreviewModal({
  images,
  startIndex = 0,
  onClose,
}: Props) {
  const [index, setIndex] = useState(startIndex);

  const total = images.length;

  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const next = () => setIndex((i) => Math.min(i + 1, total - 1));

  // ⌨️ Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
      >
        <X />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white text-sm font-medium">
        {index + 1} / {total}
      </div>

      {/* Navigation */}
      {index > 0 && (
        <button
          onClick={prev}
          className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {index < total - 1 && (
        <button
          onClick={next}
          className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Image */}
      <div className="relative w-[90vw] h-[90vh] max-w-6xl">
        <Image
          src={images[index]}
          alt="Generated preview"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
