import { Queue } from "bullmq";
import IORedis from "ioredis";

// Use a singleton for the connection to avoid too many connections
const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const generationQueue = new Queue("generation-queue", {
  connection,
});
