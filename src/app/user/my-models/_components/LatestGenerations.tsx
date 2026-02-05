"use client";

import {
  Check,
  Copy,
  Download,
  ImageIcon,
  LayoutGrid,
  Loader2,
  Mic,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useGetGenerationsByModelAndUserId } from "../_services/generate/generate-use-queries";
import DownloadButton from "@/components/shared/MediaDownloadButton";
import { toast } from "sonner";
import GeneratedAssetsGrid from "../../_components/GeneratedAssetsGrid";

type SubModelType = "photo" | "video" | "audio";

export default function Gallery({
  modelId,
  userId,
}: {
  modelId: string;
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState<SubModelType | "all">("all");

  const {
    generationsByModelIdAndUserIdData,
    generationsByModelIdAndUserIdLoading,
  } = useGetGenerationsByModelAndUserId(modelId, userId);

  const tabs = [
    { id: "all" as const, label: "All", icon: LayoutGrid },
    { id: "photo" as const, label: "Photos", icon: ImageIcon },
    { id: "video" as const, label: "Videos", icon: Video },
    { id: "audio" as const, label: "Voices", icon: Mic },
  ];

  // ⭐ Filter actual data
  const filteredGenerations = (generationsByModelIdAndUserIdData ?? []).filter(
    (item) => {
      if (activeTab === "all") return true;
      return item.type === activeTab;
    },
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Gallery</h2>
          <p className="text-sm text-gray-500">
            Your recent photo, video, and audio generations appear here
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ⭐ Loading State */}
      {generationsByModelIdAndUserIdLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      )}

      {/* ⭐ No data */}
      {!generationsByModelIdAndUserIdLoading &&
        filteredGenerations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No {activeTab !== "all" ? activeTab : ""} generations found
          </div>
        )}

      {/* ⭐ Grid */}
      {!generationsByModelIdAndUserIdLoading &&
        filteredGenerations.length > 0 && (
          <GeneratedAssetsGrid recentGenerations={filteredGenerations} />
        )}
    </div>
  );
}
