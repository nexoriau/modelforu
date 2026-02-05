import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

export const userSubscriptionsTable = pgTable('user_subscriptions', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  subscriptionId: varchar('subscription_id', { length: 255 })
    .notNull()
    .unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull(),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  eventType: varchar('event_type', { length: 255 }),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull(),
  eventTimestamp: timestamp('event_timestamp', { withTimezone: true }),
  created: timestamp('created', { withTimezone: true }),
  interval: varchar('interval', { length: 255 }),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  invoiceUrl: text('invoice_url').default(''),
  invoiceId: varchar('invoice_id', { length: 255 }).notNull(),
  tokens: integer('tokens').notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  description: text('description'),
  currency: text('currency').notNull().default('EUR'),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const userSubscriptionsTableRelations = relations(
  userSubscriptionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userSubscriptionsTable.userId],
      references: [usersTable.id],
    }),
  })
);
