import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './auth';
import { relations } from 'drizzle-orm';

export const notificationTypeEnum = pgEnum('notification_type_enum', [
  'success',
  'warning',
  'info',
]);

export const iconTypeEnum = pgEnum('icon_type_enum', [
  'audio',
  'video',
  'photo',
  'credits_low',
  'subscription',
  'invoice',
  'model',
  'referral',
  'product',
]);

export const notificationTable = pgTable('notification', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  type: notificationTypeEnum().notNull(),
  iconType: iconTypeEnum().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  softDelete: boolean('soft_delete').notNull().default(false),
  time: timestamp('time').defaultNow().notNull(),
});

// Type
export type NotificationTableType = typeof notificationTable.$inferSelect;
export type CreateNotificationType = typeof notificationTable.$inferInsert;

// Relations
export const notificationTableRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [notificationTable.userId],
      references: [usersTable.id],
    }),
  })
);