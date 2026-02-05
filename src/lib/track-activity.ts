/**
 * Activity Tracking Utility
 *
 * Provides a centralized function for logging user activities to the database.
 * Used throughout the application to create audit trails and analytics data.
 *
 * Design Philosophy:
 * - Non-blocking: Failures don't interrupt main application flow
 * - Silent errors: Logs errors but doesn't throw to prevent breaking user actions
 * - Flexible metadata: Accepts any additional data via metadata object
 */
import { db } from "@/db";
import { activityLogTable } from "@/db/schema/activity-log";

/**
 * Parameters for tracking an activity
 */
type TrackActivityParams = {
  userId: string;
  activityType:
    | "model_created" // User created a new custom model
    | "model_added" // User added/purchased a model
    | "generation_photo" // User generated a photo
    | "generation_video" // User generated a video
    | "generation_audio"; // User generated audio
  entityId?: string; // Optional ID of related entity (model, generation, etc.)
  description: string; // Human-readable description of the activity
  metadata?: {
    generation_time?: number; // Time taken for generation (in seconds)
    tokens_used?: number; // Number of tokens consumed
    model_name?: string; // Name of model used
    [key: string]: any; // Additional flexible metadata
  };
};

/**
 * Tracks a user activity by inserting a record into the activity log
 *
 * This function is designed to be non-blocking and fail-safe. If tracking fails,
 * it logs the error but doesn't throw, ensuring the main user action completes successfully.
 *
 * @param params - Activity tracking parameters
 *
 * @example
 * await trackActivity({
 *   userId: user.id,
 *   activityType: 'generation_photo',
 *   description: 'Generated profile photo',
 *   metadata: { tokens_used: 10, generation_time: 5.2, model_name: 'FLUX' }
 * });
 */
export async function trackActivity({
  userId,
  activityType,
  entityId,
  description,
  metadata,
}: TrackActivityParams) {
  try {
    await db.insert(activityLogTable).values({
      userId,
      activityType,
      entityId,
      description,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error("Failed to track activity:", error);
    // Don't throw - tracking shouldn't break the main flow
  }
}
