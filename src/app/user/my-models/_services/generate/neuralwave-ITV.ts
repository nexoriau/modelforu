'use server';

import { auth } from '@/app/auth/_services/auth';
import { getUserById } from '@/lib/utils-functions/getUserById';
import { urlToBase64 } from '@/lib/utils-functions/imageToBase64';

const API_URL = process.env.NEURALWAVE_API_ENDPOINT_ITV!;
const API_KEY = process.env.NEURALWAVE_API_KEY_ITV!;


// Helper function to pause execution (prevent API spamming)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const startGenerationITV = async ({
  image,
  text,
  fps,
  videoLength,
  quality,
}: {
  image: string;
  text: string;
  fps: string;
  videoLength: number;
  quality: string;
}) => {
  // --- 1. PRE-CHECKS (Run these only once) ---
  const session = await auth();
  if (!session?.user) {
    return { error: true, message: 'No user or no models credits' };
  }

  const userData = await getUserById(session.user.id);
  if (!userData?.id) {
    return { error: true, message: 'User not found' };
  }

  const tokensReduction = text.trim().length;
  if (Number(userData.tokens) < tokensReduction) {
    return {
      error: true,
      message: 'Not enough tokens, please buy more tokens.',
    };
  }

  if (!image) {
    return { error: true, message: 'Please provide an image.' };
  }

  const imageBase64 = await urlToBase64(image);

  // --- 2. RETRY LOOP ---
  // We loop indefinitely until we get a result or a non-busy error
  while (true) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
        },
        body: JSON.stringify({
          image: imageBase64,
          text,
          fps,
          length: videoLength,
          quality,
        }),
      });

      const data = await res.json();

      // CASE A: Server is Busy -> Wait and Retry
      if (data.status?.toLowerCase().includes('busy')) {
        console.log('Server is busy. Retrying in 2 seconds...');
        await wait(2000); // Wait 2000ms (2 seconds) before looping again
        continue;
      }

      // CASE B: Hard Error (No Job ID and Not Busy) -> Stop and return error
      if (!data.job_id) {
        return { error: true, message: 'Failed to get Job ID' };
      }

      // CASE C: Success -> Return Job ID
      return { jobId: data.job_id };
    } catch (error) {
      console.error('Network error during fetch:', error);
      // Optional: Decide if you want to retry on network errors too,
      // otherwise return the error to break the loop.
      return { error: true, message: 'Network request failed' };
    }
  }
};

export const pollStatusITV = async (jobId: string) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY,
    },
    body: JSON.stringify({ job_id: jobId, op: 'status' }),
  });

  return res.json();
};

export async function fetchResultITV(jobId: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': API_KEY,
    },
    body: JSON.stringify({ job_id: jobId, op: 'result' }),
  });

  const arrayBuffer = await res.arrayBuffer();
  return arrayBuffer;
}
