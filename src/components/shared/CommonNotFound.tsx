/**
 * Common Not Found Component
 *
 * Displays empty state message when no data is found.
 * Used throughout the application for consistent empty states.
 *
 * Two Display Modes:
 * 1. With collection name: Shows collection-specific message
 * 2. Without collection: Shows generic "no data" message with icon
 *
 * Features:
 * - Internationalization support
 * - Responsive design
 * - Visual feedback with icon and dashed border
 *
 * @param collection - Optional collection name for specific messaging
 */
"use client";
import { SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

function CommonNotFound({ collection }: { collection?: string }) {
  const { t } = useTranslation();

  // Collection-specific empty state
  return collection ? (
    <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg mt-8">
      <p className="font-semibold" suppressHydrationWarning>
        {t("commonNotFound.noCollectionFound", { collection })}
      </p>
      <p className="text-sm" suppressHydrationWarning>
        {t("commonNotFound.getStarted", { collection })}
      </p>
    </div>
  ) : (
    // Generic empty state with icon
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl mt-8 transition-colors hover:border-gray-400">
      <SearchX className="w-12 h-12 text-gray-400 mb-4" strokeWidth={1.5} />
      <p
        className="text-xl font-bold text-gray-700 mb-1"
        suppressHydrationWarning
      >
        {t("commonNotFound.noDataTitle")}
      </p>
      <p className="text-sm text-gray-500" suppressHydrationWarning>
        {t("commonNotFound.noDataDescription")}
      </p>
    </div>
  );
}

export default CommonNotFound;
