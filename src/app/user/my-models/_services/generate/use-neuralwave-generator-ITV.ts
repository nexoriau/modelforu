"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  fetchResultITV,
  pollStatusITV,
  startGenerationITV,
} from "./neuralwave-ITV";
import {
  uploadFileToCloudinary,
  uploadVideoFromBlobUrl,
} from "@/lib/utils-functions/uploadToCloudinary";

export const useNeuralWaveITV = () => {
  const [status, setStatus] = useState<
    "IDLE" | "QUEUED" | "RUNNING" | "DOWNLOADING" | "COMPLETED" | "ERROR"
  >("IDLE");

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  let currentStatus = "QUEUED";
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const generateVideoITV = async (
    image: string,
    text: string,
    fps: string,
    videoLength: number,
    quality: string,
  ) => {
    try {
      setErrorMsg(null);
      setVideoUrl(null);
      setStatus("QUEUED");

      // 1. Start job
      const start = await startGenerationITV({
        image,
        text,
        fps,
        videoLength,
        quality,
      });
      if (start.error) {
        setStatus("ERROR");
        toast.error(start.message);
        return { videoUrl: null };
      }

      // 2. Polling
      while (
        // !['IDLE', 'COMPLETED', 'ERROR'].includes(status) &&
        currentStatus !== "SUCCEEDED"
      ) {
        await wait(2500);

        const statusData = await pollStatusITV(start.jobId);
        currentStatus = statusData.status;

        if (currentStatus === "FAILED") {
          setStatus("ERROR");
          toast.error("Generation Failed");
          return { videoUrl: null };
        }
        if (currentStatus === "RUNNING") setStatus("RUNNING");
      }

      // 3. Download result
      setStatus("DOWNLOADING");

      const finalBuffer = await fetchResultITV(start.jobId);
      const file = new File([finalBuffer], "generated-video.webm", {
        type: "video/webm",
      });
      const videoUrl = await uploadFileToCloudinary(file);

      setVideoUrl(videoUrl);
      setStatus("COMPLETED");

      return { videoUrl };
    } catch (err: any) {
      setStatus("ERROR");
      setErrorMsg(err.message || "Unexpected error");
      toast.error(err.message || "Unexpected error");
    }
  };

  return {
    generateVideoITV,
    generatedVideoUrl: videoUrl,
    generationStatus: status,
    generationError: errorMsg,
    setStatus,
    isGenerating: !["IDLE", "COMPLETED", "ERROR"].includes(status),
    reset: () => {
      setStatus("IDLE");
      setVideoUrl(null);
      setErrorMsg(null);
    },
  };
};
