/**
 * Content Generation Schema
 *
 * Tracks all AI-generated content (images and videos) created by users.
 * Implements soft delete functionality for trash/restore features.
 *
 * Key Features:
 * - Links generations to users, models, and sub-models
 * - Stores multiple media URLs per generation
 * - Soft delete with 10-day auto-deletion
 * - Generation time tracking for analytics
 * - Type differentiation (photo/video)
 */
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { modelsTable } from "./models";
import { subModelTable } from "./sub-model";
import { relations } from "drizzle-orm";
import {
  generatedImagesTable,
  GenerateImageTableType,
} from "./generated-images";

/**
 * Generate Table - Content Generation Records
 *
 * Stores metadata for each generation request and its results.
 *
 * Soft Delete System:
 * - softDelete: When true, item is in trash
 * - softDeletedAt: Timestamp when moved to trash
 * - Items auto-delete permanently after 10 days in trash
 *
 * Media Storage:
 * - mediaUrl: Array of generated media URLs
 * - selectedImage: User's selected image from generation
 * - itemsLength: Number of items generated in this request
 */
export const generateTable = pgTable("generate", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  modelId: uuid("model_id")
    .references(() => modelsTable.id, { onDelete: "cascade" })
    .notNull(),
  subModelId: uuid("sub_model_id")
    .references(() => subModelTable.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(), // User's generation prompt
  mediaUrl: text("media_url").array().notNull().default([]), // Array of generated media URLs
  selectedImage: text("selected_image").notNull().default(""), // User's chosen image
  itemsLength: integer("items_length").notNull(), // Number of items generated
  type: varchar("type").notNull(), // 'photo' or 'video'

  // Soft delete fields for trash functionality
  softDelete: boolean("soft_delete").default(false).notNull(), // True when in trash
  softDeletedAt: timestamp("soft_deleted_at", { withTimezone: true }), // When moved to trash

  generationTime: integer("generation_time"), // Time taken to generate (seconds)

  // Status tracking for async generation
  status: varchar("status", { length: 20 }).notNull().default("COMPLETED"), // QUEUED, PROCESSING, COMPLETED, FAILED
  externalJobId: varchar("external_job_id"), // ID from NeuralWave API
  error: text("error"), // Error message if failed

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Generation Relations
 * Links generations to users, models, sub-models, and individual images
 */
export const generateTableRelations = relations(
  generateTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [generateTable.userId],
      references: [usersTable.id],
    }),
    model: one(modelsTable, {
      fields: [generateTable.modelId],
      references: [modelsTable.id],
    }),
    subModel: one(subModelTable, {
      fields: [generateTable.subModelId],
      references: [subModelTable.id],
    }),
    images: many(generatedImagesTable), // Individual images from this generation
  }),
);

/**
 * TypeScript Types
 */
export type GenerateTableType = typeof generateTable.$inferSelect;

/**
 * Extended type including related images
 * Used when fetching generation with all its images
 */
export type GenerateWithImagesType = GenerateTableType & {
  images: GenerateImageTableType[];
};
