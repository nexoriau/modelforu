/**
 * Media Download Button Component
 *
 * Handles downloading generated images/videos with support for:
 * - Single file downloads
 * - Multiple file downloads (creates ZIP archive)
 * - Custom filenames
 * - Loading states
 *
 * Features:
 * - Automatic ZIP creation for multiple files
 * - Unique filenames to prevent collisions
 * - Error handling with user-friendly fallback
 * - Progress indication during download
 *
 * @param url - Single URL or array of URLs to download
 * @param filename - Optional custom filename
 * @param className - Additional CSS classes
 * @param showDownloadText - Whether to show text label
 * @param type - Content type ('image' or 'video') for filename generation
 * @param isLoading - External loading state
 */
"use client";

import { getFileName } from "@/lib/utils-functions/getFileExtensions";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";

interface DownloadButtonProps {
  url: string | string[]; // Single URL or array for batch download
  filename?: string;
  className?: string;
  showDownloadText?: boolean;
  type: string; // 'image' or 'video'
  isLoading?: boolean;
}

export default function DownloadButton({
  url,
  filename,
  className = "",
  showDownloadText = false,
  type,
  isLoading = false,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  /**
   * Downloads a single file
   * Creates a temporary link element to trigger browser download
   */
  const downloadSingle = async (fileUrl: string) => {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename || getFileName(fileUrl, type);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up memory
  };

  /**
   * Downloads multiple files as a ZIP archive
   *
   * Process:
   * 1. Fetch each file
   * 2. Add to ZIP with unique filename
   * 3. Generate ZIP blob
   * 4. Trigger download
   *
   * Handles errors gracefully by skipping failed files
   */
  const downloadMultiple = async (urls: string[]) => {
    const zip = new JSZip();

    for (let i = 0; i < urls.length; i++) {
      const fileUrl = urls[i];

      try {
        const response = await fetch(fileUrl, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileUrl}`);
        }

        const blob = await response.blob();

        // Generate unique filename for each file
        const baseName =
          getFileName(fileUrl, type)?.replace(/\s+/g, "_") || `image-${i + 1}`;

        const extension = blob.type.split("/")[1] || "png";

        const finalName = `${baseName}-${i + 1}.${extension}`;

        zip.file(finalName, blob);
      } catch (err) {
        console.error("Skipping file:", fileUrl, err);
        // Continue with other files even if one fails
      }
    }

    // Ensure at least one file was added
    if (Object.keys(zip.files).length === 0) {
      throw new Error("No files were added to the ZIP");
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }, // Balance between speed and size
    });

    // Trigger ZIP download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = filename || `generation-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  /**
   * Main download handler
   * Determines whether to download single file or create ZIP
   */
  const handleDownload = async () => {
    const urls = Array.isArray(url) ? url : [url];
    if (urls.length === 0) return;

    setDownloading(true);
    try {
      if (urls.length === 1) {
        await downloadSingle(urls[0]);
      } else {
        await downloadMultiple(urls);
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file. Try right-click → Save as.");
    } finally {
      setDownloading(false);
    }
  };

  const urls = Array.isArray(url) ? url : [url];
  const isMultiple = urls.length > 1;

  return (
    <button
      onClick={handleDownload}
      disabled={downloading || isLoading}
      className={`${className} ${downloading || isLoading ? "opacity-70 animate-pulse cursor-not-allowed" : "cursor-pointer"}`}
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {showDownloadText && (isMultiple ? "Zipping..." : "Downloading...")}
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {showDownloadText &&
            (isMultiple ? `Download All (${urls.length})` : "Download")}
        </>
      )}
    </button>
  );
}
