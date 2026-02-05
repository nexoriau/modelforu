/**
 * Image with Fallback Component
 *
 * Wrapper around Next.js Image component that provides automatic fallback
 * when the primary image fails to load. Prevents broken image icons.
 *
 * Features:
 * - Automatic fallback on image load error
 * - Syncs with src prop changes
 * - Passes through all Next.js Image props
 *
 * @param src - Primary image URL
 * @param fallbackSrc - Fallback image URL (defaults to /placeholder.webp)
 * @param alt - Image alt text
 * @param props - All other Next.js Image props (width, height, etc.)
 */
"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

const ImageWithFallback = ({
  src,
  fallbackSrc = "/placeholder.webp",
  alt,
  ...props
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  // Update image source when prop changes
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        // Switch to fallback image on error
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default ImageWithFallback;
