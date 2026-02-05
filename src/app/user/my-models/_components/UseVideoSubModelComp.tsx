"use client";

import { NOTIFICATIONS_QUERY_KEY } from "@/app/_others/notification/actions/use-notification.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { SubModelTableType } from "@/db/schema/sub-model";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Info,
  Lightbulb,
  Loader2,
  LucideLoader2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useGetGenerationsByModelAndUserId } from "../_services/generate/generate-use-queries";
import { startGeneration } from "../_services/generate/generate.actions";
import { getGenerationsById } from "../_services/generate/generate.queries";
import { useQuery } from "@tanstack/react-query";
import VideoEditor from "./VideoEditor";

export default function UseVideoSubModelComp({
  subModelByIdData,
}: {
  subModelByIdData: SubModelTableType;
}) {
  const subModelType = subModelByIdData.type;
  const title = subModelType[0].toUpperCase() + subModelType.slice(1);

  // --- UI & Generation State ---
  const [activeTab, setActiveTab] = useState<"text" | "item">("item");
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const { currentUser } = useAuth();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [fps, setFps] = useState("standard");
  const [quality, setQuality] = useState("high");
  const [videoLength, setVideoLength] = useState(0);
  const [generatedDataId, setGeneratedDataId] = useState("");
  const [errors, setErrors] = useState<{
    prompt?: string;
    images?: string;
    videoLengthError?: string;
  }>({});

  const queryClient = useQueryClient();

  const {
    generationsByModelIdAndUserIdData,
    generationsByModelIdAndUserIdLoading,
  } = useGetGenerationsByModelAndUserId(
    subModelByIdData.modelId,
    currentUser?.id,
  );

  // Polling State
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(
    null,
  );

  const { data: pollingData } = useQuery({
    queryKey: ["generation-status", currentGenerationId],
    queryFn: () => getGenerationsById(currentGenerationId!),
    enabled: !!currentGenerationId,
    refetchInterval: ({ state }) => {
      if (!state.data) return 1000;
      if (state.data.status === "COMPLETED" || state.data.status === "FAILED")
        return false;
      return 3000;
    },
    //  refetchInterval: (data) => {
    //   if (!data) return 1000;
    //   if (data.status === "COMPLETED" || data.status === "FAILED") return false;
    //   return 3000;
    // },
  });

  const isGenerating =
    !!currentGenerationId &&
    pollingData?.status !== "COMPLETED" &&
    pollingData?.status !== "FAILED";
  const generationStatus = pollingData?.status || "IDLE";
  const generatedVideoUrl =
    pollingData?.status === "COMPLETED" &&
    pollingData.mediaUrl &&
    pollingData.mediaUrl.length > 0
      ? pollingData.mediaUrl[0]
      : null;

  // Effect to handle success/fail toast
  useEffect(() => {
    if (pollingData?.status === "COMPLETED") {
      toast.success(`${title} Generated!`);
      setGeneratedDataId(pollingData.id);
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ["generations", subModelByIdData.modelId, currentUser?.id],
      });
    } else if (pollingData?.status === "FAILED") {
      toast.error(pollingData.error || "Generation failed");
    }
  }, [
    pollingData,
    title,
    queryClient,
    subModelByIdData.modelId,
    currentUser?.id,
  ]);

  const resetGeneration = () => {
    setCurrentGenerationId(null);
    setGeneratedDataId("");
  };

  const handleGenerate = () => {
    resetGeneration();
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!prompt.trim()) {
      newErrors.prompt = "Prompt is required.";
      isValid = false;
    }
    if (activeTab === "item" && selectedImages.length === 0) {
      newErrors.images = "Please select an image.";
      isValid = false;
    }
    if (videoLength < 1 || videoLength > 6) {
      newErrors.videoLengthError =
        "Video length must be between 1 and 6 seconds";
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      startTransition(async () => {
        try {
          const res = await startGeneration({
            description: prompt,
            type: "video",
            modelId: subModelByIdData.modelId,
            subModelId: subModelByIdData.id,
            // Video specific params
            imageUrl: selectedImages[0],
            fps: fps,
            videoLength: videoLength,
            quality: quality,
          });

          if (res.error || !res.generatedDataId) {
            toast.error(res.message);
            return;
          }

          setCurrentGenerationId(res.generatedDataId);
          setPrompt("");
          setSelectedImages([]);
          toast.success("Generation started! Queued in background.");
        } catch (e) {
          console.error(e);
          toast.error("Error while generating");
        }
      });
    }
  };

  return (
    <div className="w-full">
      <h1 className="font-bold text-4xl mb-4">{title} Sub Model</h1>
      <Card>
        <CardContent>
          {!isGenerating && !generatedVideoUrl ? (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant={activeTab === "item" ? "default" : "outline"}
                  onClick={() => {
                    setActiveTab("item");
                    setErrors({});
                  }}
                  className="h-11 px-6 rounded-full font-medium border border-black"
                >
                  Image To {title}
                </Button>
              </div>

              <div className="flex items-start justify-center w-full gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Left: Prompt & Settings */}
                <div className="w-1/2">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Enter Prompt
                  </h3>
                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to see..."
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        if (errors.prompt)
                          setErrors((prev) => ({ ...prev, prompt: undefined }));
                      }}
                      className={`min-h-[250px] bg-white rounded-lg resize-none ${errors.prompt ? "border-red-500" : "border-gray-200"}`}
                    />
                    <Lightbulb className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.prompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {/* FPS Selection */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        Frame Rate
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 p-3 shadow-lg border-blue-100">
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                              Higher FPS results in smoother motion but may take
                              longer to generate.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </Label>
                      <Select value={fps} onValueChange={setFps}>
                        <SelectTrigger className="w-full h-12 bg-white border-gray-300 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all duration-200">
                          <span className="truncate">
                            {fps === "standard"
                              ? "Standard (32 FPS)"
                              : "Smooth (60 FPS)"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="shadow-xl border-gray-200">
                          <SelectItem
                            value="standard"
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-semibold text-gray-900">
                                Standard (32 FPS)
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                Balanced Performance
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="60"
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-semibold text-gray-900">
                                Smooth (60 FPS)
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                High Fluidity
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quality Selection */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        Render Quality
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 p-3 shadow-lg border-blue-100">
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 items-start gap-2">
                                <span className="font-semibold text-xs text-gray-900">
                                  Standard:
                                </span>
                                <span className="col-span-2 text-xs text-gray-500 font-medium">
                                  Good for quick previews
                                </span>
                              </div>
                              <div className="grid grid-cols-3 items-start gap-2">
                                <span className="font-semibold text-xs text-gray-900">
                                  High:
                                </span>
                                <span className="col-span-2 text-xs text-gray-500 font-medium">
                                  Best for final output
                                </span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger className="w-full h-12 bg-white border-gray-300 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all duration-200">
                          <span className="truncate">
                            {quality === "normal"
                              ? "Standard Definition"
                              : "High Definition"}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="shadow-xl border-gray-200">
                          <SelectItem
                            value="normal"
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-semibold text-gray-900">
                                Standard Definition
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                Efficient Generation
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="high"
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-1 text-left">
                              <span className="font-semibold text-gray-900">
                                High Definition
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                Premium Detail
                              </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration Input */}
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        Duration
                        <span className="text-[10px] text-gray-400 font-normal ml-auto">
                          (Seconds)
                        </span>
                      </Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          min={1}
                          max={6}
                          value={videoLength || ""}
                          placeholder="e.g 5"
                          className={`w-full h-9 pl-4 pr-10 bg-white border-gray-300 rounded-lg transition-all duration-200 ${
                            errors.videoLengthError
                              ? "border-red-500 focus-visible:ring-red-200"
                              : "border-gray-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-100 focus-visible:ring-blue-100"
                          }`}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setVideoLength(0);
                              return;
                            }
                            const numVal = parseInt(val);
                            // Prevent negative input and restrict > 6 logic
                            if (!isNaN(numVal) && numVal >= 0) {
                              if (numVal > 6) {
                                setVideoLength(6);
                              } else {
                                setVideoLength(numVal);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Block invalid chars like - or + or e
                            if (["-", "+", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 font-medium">
                          sec
                        </div>
                      </div>
                      <div className="flex justify-between items-start h-4">
                        <span className="text-[10px] text-gray-500 font-medium">
                          Allowed: 1 - 6 seconds
                        </span>
                        {errors.videoLengthError && (
                          <span className="text-red-600 text-[10px] font-bold">
                            {errors.videoLengthError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cost Display */}
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm mt-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-200/60 px-4 py-2 rounded-full text-amber-900">
                      <span className="text-amber-700/80 font-medium">
                        Estimated Cost:
                      </span>
                      <span className="font-bold text-amber-700">
                        {videoLength > 0 ? videoLength * 2 : 0}{" "}
                        {videoLength * 2 === 1 ? "Credit" : "Credits"}
                      </span>
                      {videoLength > 0 && (
                        <span className="text-amber-600/60 text-xs border-l border-amber-200 pl-3 ml-1">
                          {videoLength}s × 2
                        </span>
                      )}
                    </div>

                    {currentUser && (
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          Available Balance
                        </span>
                        <span className="font-bold text-gray-800">
                          {currentUser.tokens}
                        </span>
                        {Number(currentUser.tokens) < videoLength * 2 &&
                          videoLength > 0 && (
                            <span className="ml-2 text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                              Insufficient funds
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Image Gallery */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Select Source Image
                  </h3>
                  {generationsByModelIdAndUserIdLoading ? (
                    <div className="h-32 flex items-center justify-center">
                      <LucideLoader2 className="animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[250px] bg-white rounded-lg p-2 border">
                      <div className="grid grid-cols-3 gap-3">
                        {generationsByModelIdAndUserIdData
                          ?.filter((v) => v.type === "photo")
                          .map((val) =>
                            val.images
                              .filter((im) => !im.isDiscarded)
                              .map((img) => (
                                <div
                                  key={img.imageUrl}
                                  onClick={() =>
                                    setSelectedImages([img.imageUrl])
                                  }
                                  className={`relative h-24 rounded-lg cursor-pointer overflow-hidden border-4 ${selectedImages[0] === img.imageUrl ? "border-blue-500" : "border-transparent"}`}
                                >
                                  <Image
                                    src={img.imageUrl}
                                    fill
                                    alt="Source"
                                    className="object-cover"
                                  />
                                </div>
                              )),
                          )}
                      </div>
                    </ScrollArea>
                  )}
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end my-6">
                <Button
                  onClick={handleGenerate}
                  disabled={isPending || isGenerating}
                  className="h-11 px-8"
                >
                  {(isPending || isGenerating) && (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  )}
                  {isGenerating ? "Processing..." : "Generate"}
                  {!isGenerating && <ChevronDown className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 border rounded-lg p-4 bg-slate-50 animate-in zoom-in-95 duration-300">
              {isGenerating && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <h3 className="font-semibold text-lg">
                    AI is crafting your video...
                  </h3>
                  <div className="flex gap-6 text-sm font-medium text-gray-400">
                    <span
                      className={
                        generationStatus === "QUEUED"
                          ? "text-blue-600 underline"
                          : ""
                      }
                    >
                      Queued
                    </span>
                    <span>→</span>
                    <span
                      className={
                        generationStatus === "RUNNING"
                          ? "text-blue-600 underline"
                          : ""
                      }
                    >
                      Processing
                    </span>
                    <span>→</span>
                    <span
                      className={
                        generationStatus === "DOWNLOADING"
                          ? "text-blue-600 underline"
                          : ""
                      }
                    >
                      Finalizing
                    </span>
                  </div>
                  <Skeleton className="w-full max-w-[500px] aspect-video rounded-xl" />
                </div>
              )}

              {generatedVideoUrl && (
                <VideoEditor
                  initialVideoUrl={generatedVideoUrl}
                  generatedDataId={generatedDataId}
                  onReset={resetGeneration}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
