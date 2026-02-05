/**
 * Admin Dashboard Query Functions
 *
 * Provides database queries for fetching analytics and statistics
 * displayed on the admin dashboard. All functions are server-side only.
 *
 * Metrics Provided:
 * - Total user count
 * - Total models count
 * - Generated content counts (photos/videos)
 * - Total distributed tokens
 * - Total revenue received
 */
"use server";

import { db } from "@/db";
import {
  generateTable,
  modelsTable,
  subscriptionHistoryTable,
  usersTable,
} from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";

/**
 * Gets total number of users in the system
 * Subtracts 1 to exclude admin/system user
 */
export const getAllUsersCount = async () => {
  return (await db.$count(usersTable)) - 1;
};

/**
 * Gets total number of models (both system and custom trained models)
 */
export const getAllModelsCount = async () => {
  return await db.$count(modelsTable);
};

/**
 * Gets count of generated content by type
 * @param type - Type of generation ('photo' or 'video')
 * @returns Number of generations of the specified type
 */
export const getAllGeneratedCount = async (type: "photo" | "video") => {
  const [res] = await db
    .select({ count: count() })
    .from(generateTable)
    .where(eq(generateTable.type, type));
  return res.count;
};

/**
 * Gets total number of generated photos
 */
export const getAllGeneratedPhotosCount = async () => {
  return await getAllGeneratedCount("photo");
};

/**
 * Gets total number of generated videos
 */
export const getAllGeneratedVideosCount = async () => {
  return await getAllGeneratedCount("video");
};

/**
 * Calculates total tokens distributed through all subscriptions
 * Sums up token quantities from subscription history
 */
export const getAllDistributedTokens = async () => {
  const result = await db
    .select({
      tokenQuantity:
        sql<number>`sum(${subscriptionHistoryTable.tokenQuantity})`.mapWith(
          Number,
        ),
    })
    .from(subscriptionHistoryTable);

  const totalTokens = result[0].tokenQuantity;
  return totalTokens;
};

/**
 * Calculates total revenue received from all subscriptions
 * Sums up prices from subscription history
 */
export const getAllReceivedAmount = async () => {
  const result = await db
    .select({
      price: sql<number>`sum(${subscriptionHistoryTable.price})`.mapWith(
        Number,
      ),
    })
    .from(subscriptionHistoryTable);

  const totalAmount = result[0].price;
  return totalAmount;
};
