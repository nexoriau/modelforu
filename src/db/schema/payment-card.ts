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

export const paymentCardTable = pgTable('payment_cards', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  credits: integer('credits').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schema
export const paymentCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Please enter price'),
  credits: z.number().int().min(0, 'Credits must be non-negative integer'),
});

// Type
export type PaymentCardTableType = typeof paymentCardTable.$inferSelect;
export type paymentCardSchemaType = z.infer<typeof paymentCardSchema>;
