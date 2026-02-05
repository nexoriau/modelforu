/**
 * User Data Retrieval Utilities
 *
 * Provides functions to fetch user data from the database with various levels of detail.
 * Handles token calculation by combining user's free tokens with subscription tokens.
 *
 * Note: Subscription token addition is currently commented out but infrastructure is in place.
 */
"use server";

import { getValidTokens } from "@/app/auth/_services/get-valid-tokens";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { UserTableType } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

/**
 * Fetches user by ID with notification preferences and calculated total tokens
 *
 * This is the primary function used throughout the app for getting user data.
 * Includes notification preferences and calculates total available tokens.
 *
 * Token Calculation:
 * - Currently returns only user's free tokens
 * - Infrastructure exists to add subscription tokens (commented out)
 * - Subscription tokens would be added from active subscriptions
 *
 * @param userId - UUID of the user to fetch
 * @returns User object with notification preferences and total tokens, or undefined if not found
 */
export const getUserById = async (userId?: string) => {
  if (!userId) {
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    with: { notificationPreference: true }, // Include user's notification settings
  });

  if (!user?.id) {
    return;
  }

  // Fetch subscription tokens (currently not added to total)
  const { error, message, validTokens } = await getValidTokens(userId);
  if (error) {
    console.log(message);
    return;
  }

  // Calculate total tokens (subscription tokens addition is commented out)
  const totalTokens = Number(user?.tokens) || 0;
  // + validTokens;

  return {
    ...user,
    tokens: String(totalTokens),
    // tokens:
    //   (user?.tokens || 0) >= validTokens ? validTokens : user?.tokens || 0,
  } as UserTableType;
};
/**
 * Fetches basic user data for authentication purposes
 *
 * Lightweight version without relations or token calculations.
 * Used during authentication flow where only basic user data is needed.
 *
 * @param userId - UUID of the user to fetch
 * @returns Basic user object or undefined if not found
 */
export const getUserByIdForAuth = async (userId?: string) => {
  if (!userId) {
    return undefined;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  return user;
};

/**
 * Fetches user with relations and calculated tokens
 *
 * Similar to getUserById but without notification preferences.
 * Used when relations are needed but notification settings are not.
 *
 * @param userId - UUID of the user to fetch
 * @returns User object with calculated total tokens, or undefined if not found
 */
export const getUserByIdWithRelations = async (userId?: string) => {
  if (!userId) {
    return;
  }

  // Fetch subscription tokens (currently not added to total)
  const { error, message, validTokens } = await getValidTokens(userId);
  if (error) {
    console.log(message);
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
  });

  // Calculate total tokens (subscription tokens addition is commented out)
  const totalTokens = Number(user?.tokens) || 0;
  //  + validTokens;

  return {
    ...user,
    tokens: String(totalTokens),
    // tokens:
    //   (user?.tokens || 0) >= validTokens ? validTokens : user?.tokens || 0,
  } as UserTableType;
};
