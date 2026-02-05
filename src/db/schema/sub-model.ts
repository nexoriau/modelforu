/**
 * Sub-Model (Model Training) Schema
 *
 * Tracks custom model training requests submitted by users.
 * Users upload training data (images/videos/audio) to create personalized AI models.
 *
 * Training Process:
 * 1. User submits training request with data
 * 2. Status: pending → cloning → cloned (or canceled)
 * 3. Once cloned, model is ready for generation
 *
 * Key Features:
 * - Supports photo, video, and audio model training
 * - Tracks training status lifecycle
 * - Links to Google Drive for training data storage
 * - Admin can create models on behalf of users
 */
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  uuid,
  integer,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import z from "zod";
import { usersTable } from "./auth";
import { modelsTable, ModelTableType } from "./models";
import { generateTable } from "./generate";

/**
 * Sub-model training status enumeration
 * - pending: Request submitted, awaiting processing
 * - cloning: Training in progress
 * - cloned: Training complete, model ready
 * - canceled: Request canceled
 * - idle: Not currently used
 */
export const subModelStatusEnum = pgEnum("subModel_status", [
  "cloning",
  "cloned",
  "canceled",
  "pending",
  "idle",
]);

/**
 * Sub-model type enumeration
 * Determines what kind of content this model can generate
 */
export const subModelTypeEnum = pgEnum("subModel_type", [
  "audio",
  "video",
  "photo",
]);

/**
 * Sub-Model Table - Custom Model Training Requests
 *
 * Each record represents a user's request to train a custom model.
 * Training data is uploaded to Google Drive and processed externally.
 *
 * Workflow:
 * 1. User uploads training images/videos/audio
 * 2. Files stored in Google Drive (driveLink)
 * 3. External service processes training
 * 4. Status updated to 'cloned' when ready
 * 5. Model can then be used for generation
 */
export const subModelTable = pgTable("sub_model", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  modelId: uuid("model_id")
    .references(() => modelsTable.id, { onDelete: "cascade" })
    .notNull(),
  type: subModelTypeEnum().notNull(), // photo, video, or audio
  isByAdmin: boolean("is_by_admin").default(false), // Admin-created model
  status: subModelStatusEnum().notNull(), // Training status
  description: text("description").notNull(), // User's description of the model
  driveLink: text("drive_link").default("").notNull(), // Google Drive link to training data
  itemsLength: integer("items_length").notNull(), // Number of training files uploaded
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/**
 * Sub-Model Relations
 * Links training requests to users, base models, and generations
 */
export const subModelRelations = relations(subModelTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [subModelTable.userId],
    references: [usersTable.id],
  }),
  model: one(modelsTable, {
    fields: [subModelTable.modelId],
    references: [modelsTable.id],
  }),
  generations: many(generateTable), // Content generated using this trained model
}));

/**
 * Validation Schemas
 */

// Schema for photo/video model training
export const CreatePhotoVideoAudioSchema = z.object({
  description: z.string().min(2, "Description must be at least 10 characters."),
  items: z.array(z.instanceof(File)).min(1, "Please upload at least 1 item."),
});

// Schema for audio model training (voice cloning)
export const CreateAudioSchema = z.object({
  description: z.string().min(2, "Description must be at least 10 characters."),
  gender: z.string().min(1, "Please select a gender."),
  language: z.string().min(1, "Please select a language."),
  library: z.string().min(1, "Please select an library."),
  tags: z.array(z.string()),
  audioFiles: z
    .array(z.instanceof(File))
    .min(1, "Please upload at least 1 audio file."),
});

/**
 * TypeScript Types
 */
export type CreatePhotoVideoAudioSchemaType = z.infer<
  typeof CreatePhotoVideoAudioSchema
>;
export type CreateAudioSchemaType = z.infer<typeof CreateAudioSchema>;
export type SubModelTableType = typeof subModelTable.$inferSelect;
export type InsertSubModelType = typeof subModelTable.$inferInsert;

/**
 * Extended type including related model data
 */
export type SubMoelsWithModelType = SubModelTableType & {
  model: ModelTableType;
};
