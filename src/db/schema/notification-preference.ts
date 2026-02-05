import { relations } from 'drizzle-orm';
import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from './auth';

// Notification preferences table
export const notificationPreferences = pgTable('notification_preference', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  modelClonedEmail: boolean('model_cloned_email').notNull().default(true),
  modelClonedInApp: boolean('model_cloned_in_app').notNull().default(true),
  subscriptionEmail: boolean('subscription_email').notNull().default(true),
  subscriptionInApp: boolean('subscription_in_app').notNull().default(true),
  invoiceEmail: boolean('invoice_email').notNull().default(true),
  invoiceInApp: boolean('invoice_in_app').notNull().default(true),
  creditsEmail: boolean('credits_email').notNull().default(true),
  creditsInApp: boolean('credits_in_app').notNull().default(true),
  referralEmail: boolean('referral_email').notNull().default(true),
  referralInApp: boolean('referral_in_app').notNull().default(true),
  productUpdatesEmail: boolean('product_updates_email').notNull().default(true),
  productUpdatesInApp: boolean('product_updates_in_app')
    .notNull()
    .default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [notificationPreferences.userId],
      references: [usersTable.id],
    }),
  })
);

// Types
export type NotificationPreferenceTableType =
  typeof notificationPreferences.$inferSelect;
export type CreateNotificationPreference =
  typeof notificationPreferences.$inferInsert;
