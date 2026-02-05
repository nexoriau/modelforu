"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Image as ImageIcon, Video, Mic, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CommonNotFound from "@/components/shared/CommonNotFound";
import { useState } from "react";
import { SubModelTableType } from "@/db/schema/sub-model";

type SubModelType = "photo" | "video" | "audio";

interface SubModel {
  id: string;
  name: string;
  createdAt: Date | null;
  modelId: string;
  type: SubModelType;
  imageUrl: string;
}

interface MySubModelsProps {
  modelId?: string;
  allSubModels: SubModelTableType[];
}

function MySubModelsWithTypeFilter({
  modelId,
  allSubModels,
}: MySubModelsProps) {
  const [activeTab, setActiveTab] = useState<SubModelType | "all">("all");

  const filteredSubModels = allSubModels.filter((subModel) => {
    if (activeTab === "all") return true;
    return subModel.type === activeTab;
  });

  const tabs = [
    { id: "all" as SubModelType, label: "All", icon: LayoutGrid },
    { id: "photo" as SubModelType, label: "Photos", icon: ImageIcon },
    { id: "video" as SubModelType, label: "Videos", icon: Video },
    { id: "audio" as SubModelType, label: "Voices", icon: Mic },
  ];

  return (
    <Card className={`${!modelId && "border-none! border-0! shadow-none!"}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {!filteredSubModels.length ? (
          <CommonNotFound collection={`${activeTab}s`} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSubModels.map((subModel) => (
              <Link
                key={subModel.id}
                href={`/user/my-models/${subModel.modelId}/sub-model/${subModel.id}`}
                className="group"
              >
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                      src={"/dummy-nature.png"}
                      alt={subModel.type}
                      fill
                      className="object-cover"
                    />
                    {/* Diagonal lines placeholder effect */}
                    <div className="absolute inset-0 bg-linear-to-br from-transparent via-gray-200/10 to-transparent"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {subModel.type}
                    </h3>
                    <Button
                      asChild
                      className="w-full h-9 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-md"
                    >
                      <Link
                        href={`/user/my-models/${subModel.modelId}/sub-model/${subModel.id}`}
                      >
                        See Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MySubModelsWithTypeFilter;
