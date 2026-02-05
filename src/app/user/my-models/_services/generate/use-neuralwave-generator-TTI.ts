"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  fetchResultTTI,
  pollStatusTTI,
  startGenerationTTI,
} from "./neuralwave-TTI";

export const useNeuralWaveTTI = () => {
  const [status, setStatus] = useState<
    "IDLE" | "QUEUED" | "RUNNING" | "DOWNLOADING" | "COMPLETED" | "ERROR"
  >("IDLE");
  const [imagesUrl, setImagesUrl] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generateImageTTI = async (
    prompt: string,
    character: string,
    resolution: string,
    batchNumber: string,
  ) => {
    console.log("generate single");

    try {
      setErrorMsg(null);
      setImagesUrl([]);
      let currentStatus = "QUEUED";
      setStatus("QUEUED");
      // 1. Start job
      const resStartGeneration = await startGenerationTTI(
        prompt,
        character,
        resolution,
        batchNumber,
      );

      if (resStartGeneration.error) {
        setStatus("ERROR");
        toast.error(resStartGeneration.message);
        return { imagesUrl: null };
      }

      // 2. Poll until job succeeds
      while (
        // !['IDLE', 'COMPLETED', 'ERROR'].includes(status) &&
        currentStatus !== "SUCCEEDED"
      ) {
        await wait(2500);

        const statusData = await pollStatusTTI(resStartGeneration.jobId);
        currentStatus = statusData.status;

        if (currentStatus === "FAILED") {
          setStatus("ERROR");
          toast.error("Generation Failed");
          return { imagesUrl: null };
        }
        if (currentStatus === "RUNNING") setStatus("RUNNING");
      }

      // 3. Download result
      setStatus("DOWNLOADING");
      const finalImages = await fetchResultTTI(
        resStartGeneration.jobId,
        +batchNumber,
      );
      setImagesUrl(finalImages);
      setStatus("COMPLETED");

      return { imagesUrl: finalImages };
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err.message || "Unexpected error");
      toast.error(err.message || "Unexpected error");
    }
  };

  const generateBigBatchImagesTTI = async (
    prompt: string,
    character: string,
    resolution: string,
    totalImages: number,
    onProgress?: (count: number, base64: string) => void,
  ) => {
    try {
      setErrorMsg(null);
      setImagesUrl([]);
      setStatus("QUEUED");

      let completedCount = 0;
      const allImages: string[] = [];

      for (let i = 0; i < totalImages; i++) {
        setStatus("RUNNING");

        const resStartGeneration = await startGenerationTTI(
          prompt,
          character,
          resolution,
          "1",
        );

        if (resStartGeneration?.error) {
          setStatus("ERROR");
          toast.error(resStartGeneration.message);
          return { imagesUrl: null };
        }

        let currentStatus = "QUEUED";
        while (currentStatus !== "SUCCEEDED") {
          await wait(2500);
          const statusData = await pollStatusTTI(resStartGeneration.jobId);
          currentStatus = statusData.status;

          if (currentStatus === "FAILED") {
            setStatus("ERROR");
            toast.error("Image generation failed");
            return { imagesUrl: null };
          }
        }

        setStatus("DOWNLOADING");
        const finalImages = await fetchResultTTI(resStartGeneration.jobId, 1);

        if (finalImages?.length) {
          const base64 = finalImages[0];
          allImages.push(base64);

          setTimeout(() => {
            setImagesUrl((prev) => [...prev, base64]);
          }, 0);

          completedCount++;

          if (onProgress) {
            await onProgress(completedCount, base64); // AWAIT the callback!
          }

          // Force UI update by yielding to the event loop
          await new Promise((resolve) => setTimeout(resolve, 0));
        } else {
          console.warn(`No images returned for image ${i + 1}`);
        }
      }

      setStatus("COMPLETED");
      return { imagesUrl: allImages };
    } catch (err: any) {
      console.error("Error in generateBigBatchImagesTTI:", err);
      setStatus("ERROR");
      toast.error(err.message || "Unexpected error");
      return { imagesUrl: null };
    }
  };

  return {
    generateImageTTI,
    generatedImagesUrl: imagesUrl,
    generationStatus: status,
    setStatus,
    generationError: errorMsg,
    isGenerating: !["IDLE", "COMPLETED", "ERROR"].includes(status),
    generateBigBatchImagesTTI,
    reset: () => {
      setStatus("IDLE");
      setImagesUrl([]);
      setErrorMsg(null);
    },
  };
};