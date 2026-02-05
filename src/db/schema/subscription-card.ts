import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  text,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import z from 'zod';

export const subscriptionsCardTable = pgTable('subscription_card', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  model: integer('model').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  monthlyPrice: decimal('monthly_price', { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal('annual_price', { precision: 10, scale: 2 }).notNull(),
  monthlyCredits: integer('monthly_credits').notNull(),
  annualCredits: integer('annual_credits').notNull(),
  monthlyDescription: text('monthly_description').notNull(),
  annualDescription: text('annual_description').notNull(),
  features: text('features').array().notNull(),
  highlighted: boolean('highlighted').default(false),
  forAgency: boolean('for_agency').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Relations

// Schema
export const subscriptionCardTableSchema = z.object({
  model: z.coerce.number().min(1, 'Model number is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  monthlyPrice: z.coerce.number().positive('Monthly price must be positive'),
  annualPrice: z.coerce.number().positive('Annual price must be positive'),
  monthlyCredits: z.coerce
    .number()
    .int()
    .positive('Monthly credits must be a positive integer'),
  annualCredits: z.coerce
    .number()
    .int()
    .positive('Annual credits must be a positive integer'),
  monthlyDescription: z.string().min(10, 'Monthly description is too short'),
  annualDescription: z.string().min(10, 'Annual description is too short'),
  features: z.array(z.string()).min(1, 'Please add at least one feature'),
  highlighted: z.boolean().default(false),
  forAgency: z.boolean().default(false),
});

// Types
export type SubscriptionsCardTableType =
  typeof subscriptionsCardTable.$inferSelect;
export type SubscriptionCardSchemaType = z.infer<
  typeof subscriptionCardTableSchema
>;

export const updateSuscriptionCardTableSchema =
  subscriptionCardTableSchema.partial();
