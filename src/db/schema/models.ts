/**
 * AI Models Schema
 *
 * Defines the structure for AI models in the system, including:
 * - System-provided default models
 * - User-created custom models
 * - Admin-published models
 *
 * Model Visibility System:
 * - isDefaultModel: System-wide default models (FLUX, etc.)
 * - isPublishedByAdmin: Admin-approved models visible to all
 * - isVisibleToAllUsers: Controls public visibility
 * - User-specific models: Only visible to creator unless shared
 */
import { is, relations, sql } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import z from "zod";
import { subModelTable } from "./sub-model";
import { generateTable } from "./generate";
import { modelsToUsersTable } from "./models-to-users";
import { char } from "drizzle-orm/mysql-core";

/**
 * Models Table - AI Model Definitions
 *
 * Stores all AI models available in the system.
 * Supports multiple model types and visibility configurations.
 *
 * Visibility Logic:
 * - Default models (isDefaultModel=true): Visible to all users
 * - Admin-published models (isPublishedByAdmin=true): Visible to all users
 * - User models with isVisibleToAllUsers=true: Public custom models
 * - User models with isVisibleToAllUsers=false: Private to creator
 */
export const modelsTable = pgTable("model", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  character: varchar("character", { length: 255 }), // Character/persona description
  description: text("description").notNull(),
  tags: text("tags").array().default([]).notNull(), // Searchable tags
  gender: varchar("gender", { length: 255 }).notNull(), // For appropriate model selection
  imageUrl: varchar("image_url", { length: 255 }).notNull(), // Model preview image
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp().defaultNow(),

  // Visibility and access control flags
  isVisibleToAllUsers: boolean("is_visible_to_all_users")
    .default(false)
    .notNull(),
  isDefaultModel: boolean("is_default_model").default(false).notNull(), // System default models
  isPublishedByAdmin: boolean("is_published_by_admin").default(false).notNull(), // Admin-approved models
});

/**
 * Model Relations
 * Defines relationships with users, sub-models, and generations
 */
export const modelsTableRelations = relations(modelsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [modelsTable.userId],
    references: [usersTable.id],
  }),
  subModels: many(subModelTable), // Training requests for this model
  generations: many(generateTable), // Content generated using this model
  modelsToUsers: many(modelsToUsersTable), // User assignments for this model
}));

/**
 * Model Validation Schema
 * Zod schema for creating/updating models
 */
export const ModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()),
  gender: z.string().min(1, "Gender is required"),
  imageUrl: z.string().min(1, "ImageUrl is required"),
  userId: z.string(),
  isDefaultModel: z.boolean().optional(),
  isPublishedByAdmin: z.boolean().optional(),
  character: z.string().optional(),
});

/**
 * TypeScript Types
 */
export type ModelTableType = typeof modelsTable.$inferSelect;
export type ModelSchemaType = z.infer<typeof ModelSchema>;
