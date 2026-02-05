import { sql } from 'drizzle-orm';
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import z from 'zod';

export const modelCardTable = pgTable('model_cards', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schema
export const modelCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Please enter price'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative integer'),
});

// Type
export type ModelCardTableType = typeof modelCardTable.$inferSelect;
export type modelCardSchemaType = z.infer<typeof modelCardSchema>;
