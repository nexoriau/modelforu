import { relations } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

// Groups/Categories for trained models
export const trainedModelGroupsTable = pgTable('trained_model_group', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { enum: ['photo', 'video', 'audio'] }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Main trained models table
export const trainedModelsTable = pgTable('trained_model', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: varchar('external_id', { length: 255 }).unique().notNull(), // API ID
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { enum: ['photo', 'video', 'audio'] }).notNull(),
  groupId: uuid('group_id').references(() => trainedModelGroupsTable.id, { onDelete: 'set null' }),
  style: text('style'), // Style description
  sampleText: text('sample_text'), // Example prompt for preview
  voiceFileUrl: text('voice_file_url'), // For audio models
  previewImageUrl: text('preview_image_url'), // Preview image
  description: text('description'),
  
  // API configuration
  apiConfig: text('api_config').default('{}'), // JSON string with additional API params
  
  // Admin controls - SIMPLIFIED as per your suggestion
  isPublished: boolean('is_published').default(false).notNull(), // Available for assignment
  assignToAll: boolean('assign_to_all').default(false).notNull(), // Automatically assign to all users
  
  // Metadata
  createdBy: uuid('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assignments table (which users can use which trained models)
export const trainedModelAssignmentsTable = pgTable('trained_model_assignment', {
  id: uuid('id').defaultRandom().primaryKey(),
  trainedModelId: uuid('trained_model_id')
    .references(() => trainedModelsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  assignedBy: uuid('assigned_by')
    .references(() => usersTable.id, { onDelete: 'set null' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Optional expiry
});

// Relations
export const trainedModelGroupsTableRelations = relations(trainedModelGroupsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [trainedModelGroupsTable.createdBy],
    references: [usersTable.id],
  }),
  trainedModels: many(trainedModelsTable),
}));

export const trainedModelsTableRelations = relations(trainedModelsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [trainedModelsTable.createdBy],
    references: [usersTable.id],
  }),
  group: one(trainedModelGroupsTable, {
    fields: [trainedModelsTable.groupId],
    references: [trainedModelGroupsTable.id],
  }),
  assignments: many(trainedModelAssignmentsTable),
}));

export const trainedModelAssignmentsTableRelations = relations(trainedModelAssignmentsTable, ({ one }) => ({
  trainedModel: one(trainedModelsTable, {
    fields: [trainedModelAssignmentsTable.trainedModelId],
    references: [trainedModelsTable.id],
  }),
  user: one(usersTable, {
    fields: [trainedModelAssignmentsTable.userId],
    references: [usersTable.id],
  }),
  assigner: one(usersTable, {
    fields: [trainedModelAssignmentsTable.assignedBy],
    references: [usersTable.id],
  }),
}));

// Types
export type TrainedModelGroupTableType = typeof trainedModelGroupsTable.$inferSelect;
export type TrainedModelTableType = typeof trainedModelsTable.$inferSelect;
export type TrainedModelAssignmentTableType = typeof trainedModelAssignmentsTable.$inferSelect;