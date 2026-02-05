"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SubModelTableType } from "@/db/schema/sub-model";
import {
  Lightbulb,
  Loader2,
  RectangleHorizontal,
  Upload,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import ImageWithFallback from "@/components/shared/ImageWithFallback";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  createGenerate,
  discardGeneratedImage,
} from "../_services/generate/generate.actions";
import { NOTIFICATIONS_QUERY_KEY } from "@/app/_others/notification/actions/use-notification.action";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNeuralWaveTTI } from "../_services/generate/use-neuralwave-generator-TTI";
import DownloadButton from "@/components/shared/MediaDownloadButton";
import { getFileName } from "@/lib/utils-functions/getFileExtensions";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadImageFromBase64 } from "@/lib/utils-functions/uploadToCloudinary";
import { useAuth } from "@/context/AuthContext";
import { startGeneration } from "../_services/generate/generate.actions";
import { getGenerationsById } from "../_services/generate/generate.queries";
import { GenerateImageTableType } from "@/db/schema/generated-images";
import { ModelTableType } from "@/db/schema/models";
import DiscardImageDialog from "./DiscardImage";
import { useQuery } from "@tanstack/react-query";

type GenerationMode = "PAIR" | "BIG_BATCH";

export default function UsePhotoSubModelComp({
  subModelByIdData,
  selectedModelData,
}: {
  subModelByIdData: SubModelTableType;
  selectedModelData: ModelTableType;
}) {
  const subModelType = subModelByIdData.type;
  const title = subModelType[0].toUpperCase() + subModelType.slice(1);
  const [activeTab, setActiveTab] = useState<"text" | "item">("text");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const router = useRouter();
  // const [batchNumber, setBatchNumber] = useState("1");

  const [resolution, setResolution] = useState("1024x1024");
  const [selectedImage, setSelectedImage] = useState("");
  // Removed cloudinaryImages - using single source of truth with generatedImages
  const [generatedImages, setGeneratedImages] = useState<
    GenerateImageTableType[]
  >([]);

  const [mode, setMode] = useState<GenerationMode>("PAIR");
  const [bigBatchCount, setBigBatchCount] = useState("10"); // default for big batch
  const batchNumber = mode === "PAIR" ? 2 : Number(bigBatchCount);

  const [isDiscarding, setIsDiscarding] = useState({
    status: false,
    imageId: "",
  });

  const [progressCount, setProgressCount] = useState(0); // Progress tracking for big batch
  const { currentUser, refetchUser } = useAuth();

  // Validation State
  const [errors, setErrors] = useState<{
    prompt?: string;
    images?: string;
    batch?: string;
  }>({});
  const [isGeneratePending, setPending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Polling State
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(
    null,
  );

  const { data: pollingData, isLoading: isLoadingPolling } = useQuery({
    queryKey: ["generation-status", currentGenerationId],
    queryFn: () => getGenerationsById(currentGenerationId!),
    enabled: !!currentGenerationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1000;
      if (data.status === "COMPLETED" || data.status === "FAILED") return false;
      return 3000;
    },
  });

  const isGenerating =
    !!currentGenerationId &&
    pollingData?.status !== "COMPLETED" &&
    pollingData?.status !== "FAILED";
  const generationStatus = pollingData?.status || "IDLE";

  // Effect to sync polling data to local state when complete OR processing
  useEffect(() => {
    if (pollingData?.images && pollingData.images.length > 0) {
      // Update images progressively during PROCESSING and COMPLETED
      setGeneratedImages(pollingData.images as GenerateImageTableType[]);
    }

    if (pollingData?.status === "COMPLETED") {
      refetchUser();
      // Keep currentGenerationId to show results
    } else if (pollingData?.status === "FAILED") {
      toast.error(pollingData.error || "Generation failed");
      setPending(false);
    }
  }, [pollingData, refetchUser]);

  const resetGeneration = () => {
    setCurrentGenerationId(null);
    setGeneratedImages([]);
    setPending(false);
  };

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedImages([...uploadedImages, ...acceptedFiles]);
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: true,
  });

  const handleGenerate = async () => {
    resetGeneration();
    setGeneratedImages([]);
    const newErrors: { prompt?: string; images?: string; batch?: string } = {};
    let isValid = true;

    if (!prompt.trim()) {
      newErrors.prompt = "Prompt is required to generate an image.";
      isValid = false;
    }

    if (activeTab === "item" && uploadedImages.length === 0) {
      newErrors.images = "Please upload at least one reference image.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setPending(true);

    try {
      // For now, we only support Text to Image via worker in this refactor step basically.
      // But if activeTab === 'item', we need to upload images first?
      // The current worker supports Text-to-Image (TTI).
      // UsePhotoSubModelComp supports input images?
      // Ah, `generateBigBatchImagesTTI` only took prompt, char, resolution.
      // The `activeTab === 'item'` logic seems to be for "Image to Image" maybe?
      // But `generateBigBatchImagesTTI` signature is (prompt, character, resolution, batch, onProgress).
      // It DOES NOT take input images.
      // So I will assume TTI for now as per previous logic.

      const batchCount =
        mode === "PAIR" ? 2 : Math.min(100, Math.max(4, Number(bigBatchCount)));

      // Enforce minimum 2 images
      if (batchCount < 2) {
        toast.error("Minimum 2 images required for generation");
        setPending(false);
        return;
      }

      const res = await startGeneration({
        description: prompt,
        type: "photo",
        modelId: subModelByIdData.modelId,
        subModelId: subModelByIdData.id,
        batch: batchCount,
        // character: selectedModelData.character // This was passed before, I should add it to startGeneration types if needed.
        // Just added character to StartGenerationData type previously.
        character: selectedModelData.character || undefined,
      });

      if (res.error || !res.generatedDataId) {
        toast.error(res.message);
        setPending(false);
        return;
      }

      setCurrentGenerationId(res.generatedDataId);
      toast.success(
        "Generation started! You can close this tab and we'll email you.",
      );
    } catch (error) {
      console.error(error);
      toast.error("Error while starting generation");
      setPending(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="font-bold text-4xl mb-4">{title} Sub Model</h1>
      <Card>
        <CardContent>
          {!isGenerating && !generatedImages.length ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant={activeTab === "text" ? "default" : "outline"}
                  onClick={() => {
                    setActiveTab("text");
                    setErrors({});
                  }}
                  className={`h-11 px-6 rounded-full font-medium border border-black`}
                >
                  Text To {title}
                </Button>
              </div>
              <div className="flex items-start justify-center w-full gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="w-full">
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
                      className={`min-h-[180px] bg-white rounded-lg resize-none placeholder:text-gray-400 pr-10 ${
                        errors.prompt
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    <Lightbulb className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>

                  {errors.prompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3">
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger className="bg-white">
                        <SelectValue>
                          <RectangleHorizontal />
                          <label className="text-sm cursor-pointer ml-2">
                            {resolution}
                          </label>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {["1024x1024", "1080x1920", "1920x1080"].map((res) => (
                          <SelectItem key={res} value={res}>
                            {res}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-4">
                      {/* Big Batch Toggle */}
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mode === "BIG_BATCH"}
                          onChange={(e) => {
                            setMode(e.target.checked ? "BIG_BATCH" : "PAIR");
                          }}
                          className="accent-black"
                        />
                        Big batch generation
                      </label>

                      {/* Big Batch Input */}
                      {mode === "BIG_BATCH" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            // min={4}
                            max={100}
                            step={1}
                            value={bigBatchCount}
                            onChange={(e) => {
                              const value = e.target.value;
                              const num = Number(value);
                              setBigBatchCount(num.toString());
                            }}
                            onBlur={() => {
                              // fix empty input on blur
                              if (!bigBatchCount) {
                                setBigBatchCount("4");
                              }
                            }}
                            placeholder="Enter batch count"
                            className="w-[90px] rounded-md border border-gray-300 bg-white px-2 py-1 text-sm
                   focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-bold text-amber-600">
                          {+batchNumber}{" "}
                          {+batchNumber === 1 ? "Credit" : "Credits"}
                        </span>
                      </div>
                      {currentUser && (
                        <div className="text-gray-500">
                          Balance:{" "}
                          <span className="font-medium text-gray-700">
                            {currentUser.tokens}
                          </span>
                          {Number(currentUser.tokens) < +batchNumber && (
                            <span className="ml-2 text-red-500 font-medium">
                              Insufficient credits
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.batch && (
                    <p className="text-red-500 text-sm mt-1">{errors.batch}</p>
                  )}
                </div>

                {/* Upload Images Section */}
                {activeTab === "item" && (
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Upload your Images
                    </h3>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg h-[180px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        errors.images
                          ? "border-red-500 bg-red-50"
                          : isDragActive
                            ? "border-gray-400 bg-white"
                            : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload
                        className={`w-8 h-8 mb-3 ${errors.images ? "text-red-400" : "text-gray-300"}`}
                        strokeWidth={1.5}
                      />
                      <p
                        className={`text-sm ${errors.images ? "text-red-500" : "text-gray-400"}`}
                      >
                        Drag & Drop to upload required files.
                      </p>
                    </div>

                    {errors.images && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.images}
                      </p>
                    )}

                    {uploadedImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Uploaded Files ({uploadedImages.length})
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {uploadedImages.map((file: any, index) => (
                            <div
                              key={index}
                              className="relative group bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                              <div className="relative w-full h-32 mb-2 overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                                <ImageWithFallback
                                  src={
                                    typeof file === "object" && file
                                      ? URL.createObjectURL(file)
                                      : ""
                                  }
                                  fill
                                  alt={file.name || `uploaded-${index}`}
                                  className="object-cover absolute w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setUploadedImages((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  )
                                }
                                 aria-label="Remove image"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {mode === "PAIR" && (
                <div className="mb-4 mt-2 max-w-md rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>2 images will generate</li>
                    <li>
                      You may discard <b>ONE</b> image
                    </li>
                    <li>Discarding refunds 0.25 credit</li>
                    <li>The remaining image is final</li>
                  </ul>
                </div>
              )}

              {mode === "BIG_BATCH" && (
                <p className="text-sm text-orange-500 mt-2">
                  Big Batch Mode: all generated images are final and cannot be
                  discarded.
                </p>
              )}

              {/* Generate Button */}
              <div className="flex justify-end my-6">
                <Button
                  size={"lg"}
                  onClick={handleGenerate}
                  disabled={isGenerating || isGeneratePending}
                  className="h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium"
                >
                  {(isGenerating || isGeneratePending) && (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  )}
                  {isGenerating ? "Processing..." : "GENERATE"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* --- LIVE STATUS AND RESULT SECTION --- */}
              <div className="mt-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center justify-center">
                  {/* Status Steps */}
                  {isGenerating && (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <h3 className="font-semibold text-lg">
                        Generating Your Image
                      </h3>
                      <div className="flex gap-4 text-xs font-medium text-gray-500 mt-2 mb-3">
                        <span
                          className={
                            generationStatus === "QUEUED"
                              ? "text-blue-600 font-bold"
                              : ""
                          }
                        >
                          Queued
                        </span>
                        <span>→</span>
                        <span
                          className={
                            generationStatus === "RUNNING"
                              ? "text-blue-600 font-bold"
                              : ""
                          }
                        >
                          Processing{" "}
                          {mode === "BIG_BATCH" &&
                            batchNumber > 4 &&
                            `(${progressCount} of ${batchNumber})`}
                        </span>
                        <span>→</span>
                        <span
                          className={
                            generationStatus === "DOWNLOADING"
                              ? "text-blue-600 font-bold"
                              : ""
                          }
                        >
                          Finishing
                        </span>
                      </div>
                      <div
                        className={`grid overflow-hidden ${+batchNumber === 2 ? "h-[225px] w-[450px]" : "size-[450px]"} ${
                          +batchNumber > 1 ? "grid-cols-2 gap-2" : "grid-cols-1"
                        }`}
                      >
                        {Array.from({ length: +batchNumber }).map(
                          (_, index) => {
                            const generatedImage = generatedImages[index];

                            return generatedImage ? (
                              <div
                                key={generatedImage.id}
                                className="relative w-full h-full rounded-lg overflow-hidden border-4 border-green-400 shadow-md animate-in fade-in zoom-in-95 duration-300"
                              >
                                <ImageWithFallback
                                  src={generatedImage.imageUrl}
                                  alt={`Generated ${index + 1}`}
                                  fill
                                  unoptimized
                                  className="object-contain"
                                  priority
                                />
                              </div>
                            ) : (
                              <Skeleton
                                key={index}
                                className="w-full h-full border"
                              />
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {/* Result Image - Only show after generation is COMPLETE */}
                  {pollingData?.status === "COMPLETED" &&
                  !!generatedImages.length ? (
                    <div className="w-full max-w-md">
                      <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">Generation Complete</span>
                      </div>
                      {!selectedImage &&
                      generatedImages.filter((img) => !img.isDiscarded).length >
                        0 ? (
                        <div>
                          <div
                            className={`min-h-[200px] md:min-w-[250px] bg-gray-100 grid ${
                              generatedImages.length > 1
                                ? "grid-cols-2 gap-2"
                                : "grid-cols-1"
                            }`}
                          >
                            {generatedImages
                              .filter((img) => !img.isDiscarded) // filter discarded images
                              .map((generatedImage, ind) => (
                                <div
                                  key={generatedImage.id}
                                  className="relative aspect-square w-full rounded-lg overflow-hidden border-4 border-gray-200 shadow-md cursor-pointer hover:border-cyan-500 duration-200"
                                  onClick={() => {
                                    if (isDialogOpen || isDiscarding.status)
                                      return;
                                    setSelectedImage(generatedImage.imageUrl);
                                  }}
                                >
                                  {/* Discard Button only show if user generate max 4 images */}
                                  {Number(batchNumber) < 3 &&
                                  generatedImages.length > 1 ? (
                                    <DiscardImageDialog
                                      imageId={generatedImage.id}
                                      generatedId={generatedImage.generateId}
                                      setGeneratedImages={setGeneratedImages}
                                      generatedImages={generatedImages}
                                      setDialogOpen={setIsDialogOpen}
                                      isDiscarding={isDiscarding}
                                      setIsDiscarding={setIsDiscarding}
                                      skipConfirmation={true}
                                    />
                                  ) : null}

                                  <ImageWithFallback
                                    src={generatedImage.imageUrl}
                                    alt={`AI Generated Result ${ind + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                    priority={ind < 2}
                                  />
                                </div>
                              ))}
                          </div>

                          {/* PAIR Mode Info - Show after generation */}
                          {mode === "PAIR" && generatedImages.length === 2 && (
                            <div className="mb-4 mt-3 max-w-md rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-left">
                              <ul className="list-disc pl-5 text-blue-700 space-y-1 text-left">
                                <li>2 images will generate</li>
                                <li>
                                  You may discard <b>ONE</b> image
                                </li>
                                <li>Discarding refunds 0.25 credit</li>
                                <li>The remaining image is final</li>
                              </ul>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                resetGeneration();
                                setSelectedImage("");
                                setPrompt("");
                                // setBatchNumber("1");
                                setMode("PAIR");
                                setBigBatchCount("2");
                                setGeneratedImages([]);
                                // ✅ Refetch user to update token balance in navbar
                                await refetchUser();
                              }}
                              className="sm:flex-1 w-full mx-auto"
                            >
                              Close
                            </Button>

                            {generatedImages.filter((img) => !img.isDiscarded)
                              .length === 1 && (
                              <Button
                                onClick={() =>
                                  setSelectedImage(
                                    generatedImages.filter(
                                      (img) => !img.isDiscarded,
                                    )[0].imageUrl,
                                  )
                                }
                                className="sm:flex-1 w-full mx-auto"
                              >
                                Open Image
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-200 shadow-md">
                            <Button
                              size={"icon-lg"}
                              className="absolute top-2 left-2 z-20 rounded-full border-2 border-white"
                              variant={"default"}
                              onClick={() => {
                                setSelectedImage("");
                              }}
                            >
                              <ArrowLeft />
                            </Button>
                            <ImageWithFallback
                              src={selectedImage}
                              alt="AI Result"
                              fill
                              className="object-cover min-h-[130px] border border-gray-200 bg-gray-50"
                            />
                          </div>
                          <DownloadButton
                            filename={getFileName(selectedImage, "photo")}
                            className="flex items-center justify-center gap-2 mt-4 w-full bg-black hover:bg-black/90 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md"
                            type="photo"
                            url={selectedImage}
                            showDownloadText={true}
                          />
                        </div>
                      )}
                    </div>
                  ) : isGenerating ? null : (
                    <div className="my-3 md:min-h-[400px] min-h-[200px] grid grid-col-1 md:w-[350px] w-[280px] max-w-full rounded">
                      <Skeleton className="w-full h-full border" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
