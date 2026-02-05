import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { generateTable } from "./generate";
import { relations } from "drizzle-orm";

export const generatedImagesTable = pgTable("generated_images", {
  id: uuid("id").defaultRandom().primaryKey(),

  generateId: uuid("generate_id")
    .references(() => generateTable.id, { onDelete: "cascade" })
    .notNull(),

  imageUrl: text("image_url").notNull(),

  isDiscarded: boolean("is_discarded").default(false).notNull(),

  discardedAt: timestamp("discarded_at", { withTimezone: true }),

  isSelected: boolean("is_selected").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const generatedImagesRelations = relations(
  generatedImagesTable,
  ({ one }) => ({
    generate: one(generateTable, {
      fields: [generatedImagesTable.generateId],
      references: [generateTable.id],
    }),
  })
);

// Type
export type GenerateImageTableType = typeof generatedImagesTable.$inferSelect;
