"use server";

import { auth } from "@/app/auth/_services/auth";
import { getUserById } from "@/lib/utils-functions/getUserById";
import { uploadImageFromBase64 } from "@/lib/utils-functions/uploadToCloudinary";
import JSZip from "jszip";

const API_URL = process.env.NEURALWAVE_API_ENDPOINT_TTI!;
const API_KEY = process.env.NEURALWAVE_API_KEY_TTI!;

const wait = async (ms: number) => new Promise((rs) => setTimeout(rs, ms));

export async function startGenerationTTI(
  prompt: string,
  character: string,
  resolution: string,
  batchNumber: string,
) {
  const session = await auth();
  if (!session?.user) {
    return { error: true, message: "No user or no models credits" };
  }
  const userData = await getUserById(session.user.id);
  if (!userData?.id) {
    return { error: true, message: "User not found" };
  }
  const tokensReduction = prompt.trim().length;
  if (Number(userData.tokens) < tokensReduction) {
    return {
      error: true,
      message: "Not enough tokens, please buy more tokens.",
    };
  }

  while (true) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": API_KEY,
        },
        body: JSON.stringify({
          text: prompt,
          resolution,
          interpret_prompt: true,
          character,
          batch: +batchNumber,
        }),
      });

      const data = await res.json();
      if (data.status.toLowerCase().includes("busy")) {
        console.log("Server is busy. Retrying in 2 seconds...");
        await wait(2000); // Wait 2000ms (2 seconds) before looping again
        continue;
      }
      if (!data.job_id) {
        return { error: true, message: "Failed to get Job ID" };
      }

      return { jobId: data.job_id };
    } catch (error) {
      console.error("Network error during fetch:", error);
      // Optional: Decide if you want to retry on network errors too,
      // otherwise return the error to break the loop.
      return { error: true, message: "Network request failed" };
    }
  }
}

export async function pollStatusTTI(jobId: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": API_KEY,
    },
    body: JSON.stringify({ job_id: jobId, op: "status" }),
  });

  return res.json();
}

export async function fetchResultTTI(
  jobId: string,
  batchNumber: number,
): Promise<string[]> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": API_KEY,
    },
    body: JSON.stringify({ job_id: jobId, op: "result" }),
  });

  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

  const arrayBuffer = await res.arrayBuffer();

  // 1. If batchNumber > 1, try to treat it as a ZIP file
  if (batchNumber > 1) {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(arrayBuffer);
      const imageUrls: string[] = [];

      // Iterate through files in the zip
      for (const filename of Object.keys(zipContent.files)) {
        const file = zipContent.files[filename];

        // Skip directories if any
        if (!file.dir) {
          const base64Data = await file.async("base64");
          imageUrls.push(`data:image/png;base64,${base64Data}`);
        }
      }

      return imageUrls;
    } catch (error) {
      console.warn(
        "Expected ZIP but failed to decode, falling back to PNG base64 logic.",
      );
      return [];
      // If zip decoding fails, it falls through to the PNG logic below
    }
  }

  // 2. Default: Treat as a single PNG base64 string
  // Use Buffer for Node.js or btoa for browser-based environments
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return [`data:image/png;base64,${base64}`];
}
