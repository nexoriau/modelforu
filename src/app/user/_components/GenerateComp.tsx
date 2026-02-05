/**
 * Generate Component - Main AI Content Generation Interface
 *
 * Primary user interface for generating AI content (images, videos, audio).
 * Provides model selection carousel and content type tabs.
 *
 * Features:
 * - Model selection via interactive carousel
 * - Content type tabs (photo/video/audio)
 * - URL parameter support for deep linking to specific models
 * - Real-time selection state management
 * - Responsive design with smooth animations
 * - Default model badges
 * - Gender and tag display for models
 *
 * User Flow:
 * 1. Select a model from carousel
 * 2. Choose content type (photo/video/audio)
 * 3. Enter prompt in GenerateCompBottomSection
 * 4. Generate content
 *
 * URL Parameters:
 * - ?model=<modelId> - Pre-select a specific model
 * - ?type=<photo|video|audio> - Pre-select content type
 *
 * @param modelsData - Array of available AI models
 */
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelTableType } from "@/db/schema/models";
import { ImagePlus, Info, Mic, Video } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import GenerateCompBottomSection from "./GenerateCompBottomSection";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

type Props = {
  modelsData: ModelTableType[];
};

export default function GenerateComp({ modelsData }: Props) {
  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<ModelTableType | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"photo" | "video" | "audio">(
    "photo",
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const qParams = new URLSearchParams(searchParams);
  const modelIdFromQueryParam = qParams.get("model");
  const modelTypeFromQueryParam = qParams.get("type");

  const [prompt, setPrompt] = useState("");

  /**
   * Handles content type tab changes
   * Clears URL parameters when user manually switches tabs
   */
  const handleTabChange = (value: string) => {
    if (modelIdFromQueryParam) {
      qParams.delete("model");
    }
    if (modelTypeFromQueryParam) {
      qParams.delete("type");
    }
    router.replace("/user/generate", { scroll: false });
    setActiveTab(value as "photo" | "video" | "audio");
  };

  /**
   * Handle deep linking from URL parameters
   * Pre-selects model and type when coming from external link
   * Scrolls to generation form for better UX
   */
  useEffect(() => {
    if (modelIdFromQueryParam) {
      const requiredModel = modelsData.find(
        (v) => v.id === modelIdFromQueryParam,
      );
      if (requiredModel) {
        setSelectedAvatar(requiredModel);
        setActiveTab(modelTypeFromQueryParam as "photo" | "video" | "audio");
        // Auto-scroll to generation form
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [modelIdFromQueryParam, modelTypeFromQueryParam, modelsData]);

  return (
    <Card>
      <CardHeader className="space-y-4 border-b">
        <CardTitle className="text-4xl font-bold flex items-center justify-between">
          {t("generate.title")}
        </CardTitle>
        <CardDescription>{t("generate.description")}</CardDescription>

        {/* Tabs for Content Type Selection */}
        <fieldset disabled={!selectedAvatar}>
          <div className="pt-2">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 h-11">
                <TabsTrigger value="photo" className="gap-2">
                  <ImagePlus className="w-4 h-4" />
                  {t("generate.tabs.photo")}
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2">
                  <Video className="w-4 h-4" />
                  {t("generate.tabs.video")}
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-2">
                  <Mic className="w-4 h-4" />
                  {t("generate.tabs.audio")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </fieldset>
      </CardHeader>
      {/* --- Content Area --- */}
      <CardContent className="pt-6 space-y-8">
        {/* Avatar Selection */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center">
            {t("generate.avatarSection.title")}
            {selectedAvatar && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {t("generate.avatarSection.selected", {
                  name: selectedAvatar.name,
                })}
              </span>
            )}
          </h2>

          <div className="relative">
            <Carousel className="w-full max-w-6xl mx-auto relative ">
              <CarouselContent className="px-2 py-6 pb-10">
                {modelsData?.map((avatar) => (
                  <CarouselItem
                    key={avatar.id}
                    className="basis-full md:basis-1/3 px-4"
                  >
                    <div
                      onClick={() => {
                        // Clear URL params when user manually selects model
                        if (modelIdFromQueryParam) {
                          qParams.delete("model");
                        }
                        if (modelTypeFromQueryParam) {
                          qParams.delete("type");
                        }
                        router.replace("/user/generate", { scroll: false });
                        // Toggle selection (click again to deselect)
                        setSelectedAvatar((prev) =>
                          prev?.id === avatar.id ? null : avatar,
                        );
                      }}
                      className="cursor-pointer group"
                    >
                      <Card
                        className={`border-2 transition-all py-0 duration-300 ease-in-out group-hover:scale-[1.02] ${
                          selectedAvatar?.id === avatar.id
                            ? "border-primary shadow-xl ring-2 ring-primary/30 scale-[1.02]"
                            : "border-border hover:border-primary/70 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <CardContent className="p-4 relative">
                          {/* Image */}
                          <div className="aspect-square relative overflow-hidden rounded-xl mb-3 bg-muted/50 border group-hover:bg-muted transition-colors">
                            {avatar.isDefaultModel && (
                              <span className="px-2 z-50 absolute border-2 border-white py-1 rounded-full text-sm font-semibold bg-black text-white top-2 right-2">
                                {t("generate.avatarSection.defaultBadge")}
                              </span>
                            )}
                            <Image
                              src={avatar.imageUrl}
                              alt={avatar.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                            />

                            {selectedAvatar?.id === avatar.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-primary-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
                          </div>

                          {/* Content */}
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground truncate text-center">
                              {avatar.name}
                            </p>

                            {/* Tags */}
                            {avatar.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {avatar.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {avatar.tags.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    +{avatar.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Gender Badge */}
                            <div className="flex justify-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${
                                  avatar.gender.toLowerCase() === "male"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : avatar.gender.toLowerCase() === "female"
                                      ? "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {avatar.gender}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-2 hover:bg-accent hover:text-accent-foreground transition-all shadow-lg hover:shadow-xl z-10" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-2 hover:bg-accent hover:text-accent-foreground transition-all shadow-lg hover:shadow-xl z-10" />
            </Carousel>
          </div>
        </div>
        {/* --- Separator --- */}
        <hr className="my-6" />

        {/* Prompt Section */}
        <div className="space-y-4">
          <h2 className="text-2xl text-center font-bold">
            {t("generate.promptSection.title")}
          </h2>

          {!selectedAvatar ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl transition-all duration-300">
              <div className="bg-white rounded-full p-3 mb-3 shadow-sm">
                <Info className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {t("generate.promptSection.noAvatarTitle")}
              </h3>
              <p className="text-sm text-slate-600 text-center max-w-md">
                {t("generate.promptSection.noAvatarDescription")}
              </p>
            </div>
          ) : (
            <div
              className="space-y-5"
              onMouseEnter={() => {
                if (modelIdFromQueryParam) {
                  qParams.delete("model");
                }
                if (modelTypeFromQueryParam) {
                  qParams.delete("type");
                }
                router.replace("/user/generate", { scroll: false });
              }}
            >
              <GenerateCompBottomSection
                selectedModelData={selectedAvatar}
                activeTab={activeTab}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
