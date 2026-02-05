import "dotenv/config";
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";

// Note: We might need slightly modified versions of these functions if they rely on `auth()` which isn't available in worker.
// But startGenerationTTI calls `auth()`... WE NEED TO REFACTOR THAT.
// The worker cannot call `auth()`. It should receive the necessary data (prompt, etc) in the job data.
// Wait, `startGenerationTTI` in `neuralwave-TTI.ts` checks auth. I need to bypass that or refactor.
// Actually, the worker calls the *External API*. `startGenerationTTI` does that.
// I should probably duplicate the raw fetch logic here or refactor `neuralwave-TTI.ts` to separate auth check from API call.

import {
  processGenerationResult,
  processGenerationFailure,
} from "./lib/services/generation-service";

// Helper to upload without client dependencies
async function uploadImageFromBase64(
  base64String: string,
  resourceType: "image" | "video" = "image",
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  if (!cloudName || !uploadPreset) throw new Error("Missing Cloudinary config");

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append("file", base64String);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const data = await response.json();
  return data.secure_url;
}

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Helper to fetch and convert image to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type") || "image/png";
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

// We need raw API functions that don't check NextAuth
const API_URL_TTI = process.env.NEURALWAVE_API_ENDPOINT_TTI!;
const API_KEY_TTI = process.env.NEURALWAVE_API_KEY_TTI!;
const API_URL_ITV = process.env.NEURALWAVE_API_ENDPOINT_ITV!;
const API_KEY_ITV = process.env.NEURALWAVE_API_KEY_ITV!;

async function callNeuralWave(payload: any, url: string, key: string) {
  let attempts = 0;
  const maxInternalRetries = 15; // Retry for ~45 seconds internally

  while (attempts < maxInternalRetries) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": key,
        },
        body: JSON.stringify(payload),
      });

      // Parse response first (like legacy code)
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // If not JSON, treat as error
        throw new Error(
          `Failed to parse NeuralWave response: ${text.substring(0, 100)}...`,
        );
      }

      // Check if response indicates BUSY (like legacy: data.status.toLowerCase().includes("busy"))
      if (data.status && data.status.toLowerCase().includes("busy")) {
        console.log(
          `NeuralWave API Busy (Attempt ${attempts + 1}/${maxInternalRetries}). Retrying in 3s...`,
        );
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;
        continue;
      }

      // If we got here and response was not OK, it's a real error
      if (!res.ok) {
        throw new Error(`NeuralWave API Error (${res.status}): ${text}`);
      }

      // Success
      return data;
    } catch (error: any) {
      // Network errors - retry
      if (!error.message.includes("NeuralWave API Error")) {
        console.log(
          `Network error invoking NeuralWave: ${error.message}. Retrying...`,
        );
        await new Promise((r) => setTimeout(r, 3000));
        attempts++;
        continue;
      }
      // API errors (non-busy) - throw immediately
      throw error;
    }
  }
  throw new Error("NeuralWave API Busy: Exceeded max internal retries");
}

async function pollStatus(jobId: string, url: string, key: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": key,
    },
    body: JSON.stringify({ job_id: jobId, op: "status" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NeuralWave Poll Error (${res.status}): ${text}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(
      `Failed to parse NeuralWave Poll response: ${text.substring(0, 100)}...`,
    );
  }
}

async function fetchResult(jobId: string, url: string, key: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": key,
    },
    body: JSON.stringify({ job_id: jobId, op: "result" }),
  });
  return res.arrayBuffer(); // We handle buffer locally
}

// Worker
const worker = new Worker(
  "generation-queue",
  async (job) => {
    console.log(`Processing job ${job.id} for user ${job.data.userId}`);

    // We expect job.data to contain: { prompt, character, resolution, batch, type: 'photo'|'video', userId, generationId, modelId, ... }

    try {
      let externalJobId;

      // 1. Start Generation
      if (job.data.type === "photo") {
        const payload = {
          text: job.data.description, // Mapped from description
          resolution: job.data.resolution || "1024x1024",
          interpret_prompt: true,
          character: job.data.character,
          batch: job.data.batch || 1,
        };
        console.log("Sending TTI Payload:", JSON.stringify(payload));

        const data = await callNeuralWave(payload, API_URL_TTI, API_KEY_TTI);

        if (!data.job_id)
          throw new Error(data.message || "Failed to start TTI job");
        externalJobId = data.job_id;
      } else if (job.data.type === "video") {
        // Implement video call logic similar to ITV hook

        // Map FPS
        let fps = 30;
        if (job.data.fps === "60") fps = 60;

        // Map Quality
        let quality = "standard";
        if (job.data.quality === "high") quality = "high";

        // Convert Image URL to Base64
        const imageBase64 = await fetchImageAsBase64(job.data.imageUrl);

        const payload = {
          image: imageBase64, // Correct key: image
          text: job.data.description, // Mapped from description
          fps: fps.toString(), // API expects string? Legacy passed string. Sending as string to be safe.
          length: job.data.videoLength || 4, // Correct key: length
          quality: quality,
        };

        // Log without huge base64
        console.log(
          "Sending ITV Payload:",
          JSON.stringify({ ...payload, image: "BASE64_STRING_TRUNCATED" }),
        );

        const data = await callNeuralWave(payload, API_URL_ITV, API_KEY_ITV);

        if (!data.job_id)
          throw new Error(data.message || "Failed to start ITV job");
        externalJobId = data.job_id;
      }

      console.log(
        `External Job ID: ${externalJobId}. Waiting for completion...`,
      );

      // 2. Poll
      let status = "QUEUED";
      let attempts = 0;
      const maxAttempts = 240; // 10 mins approx if 2.5s interval

      while (status !== "SUCCEEDED" && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2500));
        const statusData = await pollStatus(
          externalJobId,
          job.data.type === "photo" ? API_URL_TTI : API_URL_ITV,
          job.data.type === "photo" ? API_KEY_TTI : API_KEY_ITV,
        );

        if (status !== statusData.status) {
          console.log(`Job ${job.id} Status: ${statusData.status}`);
          if (statusData.status === "FAILED") {
            console.error(
              "Job Failed. Full Status Data:",
              JSON.stringify(statusData, null, 2),
            );
          }
        }
        status = statusData.status;

        if (status === "FAILED")
          throw new Error(
            `External generation failed: ${JSON.stringify(statusData)}`,
          );
        attempts++;
      }

      if (status !== "SUCCEEDED")
        throw new Error("Timeout waiting for generation");

      console.log(`Job ${job.id} Completed! Downloading results...`);

      // 3. Download & Upload
      const buffer = await fetchResult(
        externalJobId,
        job.data.type === "photo" ? API_URL_TTI : API_URL_ITV,
        job.data.type === "photo" ? API_KEY_TTI : API_KEY_ITV,
      );

      // Process single file (Photo or Video)
      // Since we now create individual jobs with batch=1, we always get a single file
      const base64 = Buffer.from(buffer).toString("base64");
      const isVideo = job.data.type === "video";
      const prefix = isVideo
        ? "data:video/mp4;base64,"
        : "data:image/png;base64,";
      const url = await uploadImageFromBase64(
        `${prefix}${base64}`,
        isVideo ? "video" : "image",
      );

      if (!url) {
        throw new Error("Failed to upload media to Cloudinary");
      }

      // 4. Save to DB
      const totalImages = job.data.totalImages || 1;
      const currentIndex = job.data.imageIndex || 1;

      await processGenerationResult({
        generationId: job.data.generationId,
        userId: job.data.userId,
        modelId: job.data.modelId,
        type: job.data.type,
        mediaUrls: [url],
        generationTime: Math.round(attempts * 2.5),
        prompt: job.data.description,
        batchSize: totalImages,
        isPartialBatch: totalImages > 1,
        currentCount: currentIndex,
        totalExpected: totalImages,
      });

      console.log(
        `Job ${job.id} Successfully Processed! Image ${currentIndex}/${totalImages} saved.`,
      );
    } catch (error: any) {
      const maxAttempts = job.opts.attempts || 1;
      const attemptNum = job.attemptsMade + 1;
      console.error(
        `Job ${job.id} failed (Attempt ${attemptNum}/${maxAttempts}):`,
        error,
      );

      // Only refund/fail if this was the last attempt
      if (attemptNum >= maxAttempts) {
        console.log(
          `Job ${job.id} exhausted all retries. Processing failure...`,
        );

        // Calculate refund amount
        let refundAmount = 0;
        if (job.data.type === "photo") {
          refundAmount = job.data.batch || 1;
        } else if (job.data.type === "video") {
          refundAmount = (job.data.videoLength || 0) * 2;
        }

        await processGenerationFailure(
          job.data.generationId,
          error.message,
          refundAmount,
        );
      }

      throw error;
    }
  },
  { connection },
);

console.log("Worker started...");
