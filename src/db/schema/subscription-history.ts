/**
 * Subscription and Payment History Schema
 *
 * Tracks all payment transactions including:
 * - One-time token purchases
 * - Recurring subscriptions
 * - Invoice generation and storage
 * - Company billing information
 * - Subscription lifecycle events
 *
 * This table serves as the complete financial audit trail for the application.
 */
import {
  pgTable,
  varchar,
  integer,
  decimal,
  text,
  timestamp,
  boolean,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { usersTable } from "./auth";

/**
 * Subscription History Table - Payment Transaction Records
 *
 * Stores all payment transactions with complete billing details.
 * Supports both one-time purchases and recurring subscriptions.
 *
 * Key Fields:
 * - subscriptionId: Unique Stripe subscription/payment ID
 * - source: 'purchase' (one-time) or 'subscription' (recurring)
 * - type: 'One-Time' or subscription plan name
 * - tokenQuantity: Number of tokens purchased
 * - tokensExpireAt: When tokens expire (for subscriptions)
 *
 * Invoice Management:
 * - invoiceUrl: Link to Stripe-hosted invoice
 * - invoiceId: Stripe invoice identifier
 * - companyName, vatNumber, companyAddress: For business invoices
 *
 * Subscription Lifecycle:
 * - cancelAtPeriodEnd: User requested cancellation
 * - currentPeriodEnd: When subscription renews/ends
 * - cancellationFeedback/Comment: User feedback on cancellation
 */
export const subscriptionHistoryTable = pgTable("subscription_history", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  subscriptionId: varchar("subscription_id", { length: 255 })
    .notNull()
    .unique(), // Stripe subscription/payment ID
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "set null", // Keep history even if user deleted
  }),
  cardType: varchar("card_type", { length: 255 }), // e.g., 'visa', 'mastercard'
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  source: varchar("source", { length: 255 }).notNull().default("purchase"), // 'purchase' or 'subscription'
  type: varchar("type", { length: 255 }).notNull().default("One-Time"), // Plan type
  description: varchar("description", { length: 255 }), // Human-readable description
  tokenQuantity: integer("token_quantity").notNull(), // Tokens purchased
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), // Amount paid
  invoiceUrl: text("invoice_url"), // Stripe-hosted invoice URL
  invoiceId: varchar("invoice_id", { length: 255 }).notNull(), // Stripe invoice ID
  createdDate: timestamp("created_date", { withTimezone: true }), // Payment date
  tokensExpireAt: timestamp("tokens_expire_at", {
    withTimezone: true,
  }), // When subscription tokens expire

  // Company billing information (for business customers)
  companyName: varchar("company_name", { length: 255 }),
  vatNumber: varchar("vat_number", { length: 255 }),
  companyAddress: text("company_address"),

  // Subscription-specific fields
  eventType: varchar("event_type", { length: 255 }), // Stripe webhook event type
  interval: varchar("interval", { length: 255 }), // 'month', 'year', etc.
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false), // Scheduled cancellation
  cancellationFeedback: text("cancellation_feedback"), // Reason for cancellation
  cancellationComment: text("cancellation_comment"), // Additional user comments
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }), // When subscription renews/ends

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Subscription History Relations
 * Links payment records to users
 */
export const subscriptionHistoryTableRelations = relations(
  subscriptionHistoryTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [subscriptionHistoryTable.userId],
      references: [usersTable.id],
    }),
  }),
);

/**
 * TypeScript Type
 */
export type SubscriptionHistoryTableType =
  typeof subscriptionHistoryTable.$inferSelect;
