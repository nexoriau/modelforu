"use client";

import DownloadButton from "@/components/shared/MediaDownloadButton";
import {
  GenerateTableType,
  GenerateWithImagesType,
} from "@/db/schema/generate";
import {
  getDownloadUrl,
  getFileName,
} from "@/lib/utils-functions/getFileExtensions";
import { Check, Download } from "lucide-react";
import Image from "next/image";
import DashboardGalleryGrid from "./DashboardGalleryGrid";
import { useTranslation } from "react-i18next";

export default function RecentModelActivity({
  recentGenerations,
  userId,
}: {
  recentGenerations: any[];
  userId?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div data-tour="recent-activity">
          <h2
            className="text-2xl font-bold text-gray-900 mb-1"
            suppressHydrationWarning
          >
            {t("user.dashboard.recentActivity.title")}
          </h2>
          <p className="text-sm text-gray-500" suppressHydrationWarning>
            {t("user.dashboard.recentActivity.description")}
          </p>
        </div>
      </div>

      {/* Activity Cards Grid */}
      <DashboardGalleryGrid generations={recentGenerations} userId={userId} />
    </div>
  );
}
