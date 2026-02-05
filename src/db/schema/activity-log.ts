/**
 * Activity Log Database Schema
 *
 * Tracks all user activities and system events for audit trails and analytics.
 * Provides a comprehensive history of user actions including image generation,
 * model training, purchases, and other significant events.
 *
 * Use Cases:
 * - Admin dashboard activity monitoring
 * - User activity history display
 * - Audit trails for compliance
 * - Analytics and usage patterns
 */
import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

/**
 * Activity Log Table Definition
 *
 * @field id - Unique identifier for each activity log entry
 * @field userId - Reference to the user who performed the activity (cascades on delete)
 * @field activityType - Type of activity (e.g., 'image_generated', 'model_trained', 'purchase_made')
 * @field entityId - Optional reference to related entity (model ID, generation ID, etc.)
 * @field description - Human-readable description of the activity
 * @field metadata - Flexible JSON field for activity-specific data (generation time, tokens used, etc.)
 * @field createdAt - Timestamp when the activity occurred
 */
export const activityLogTable = pgTable("activity_log", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"), // References model.id or generate.id
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // { generation_time: 123, tokens_used: 10, etc }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const activityLogTableRelations = relations(
  activityLogTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [activityLogTable.userId],
      references: [usersTable.id],
    }),
  }),
);

/**
 * TypeScript Types
 * @type ActivityLogType - Type for selecting/reading activity log records
 * @type ActivityLogInsertType - Type for inserting new activity log records
 */
export type ActivityLogType = typeof activityLogTable.$inferSelect;
export type ActivityLogInsertType = typeof activityLogTable.$inferInsert;
