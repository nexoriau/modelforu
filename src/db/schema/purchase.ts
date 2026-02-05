/**
 * Purchase (Payments) Schema
 *
 * Tracks one-time payment transactions for:
 * - Token purchases
 * - Model training purchases
 *
 * This differs from subscription_history which tracks recurring subscriptions.
 * Both tables together provide complete payment history.
 *
 * Key Features:
 * - Stripe session tracking
 * - Invoice generation and storage
 * - Payment status monitoring
 * - User deletion safe (onDelete: 'set null')
 */
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  integer,
  numeric,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

/**
 * Purchase type enumeration
 * - token: One-time token purchase
 * - model: Custom model training purchase
 */
export const typeEnum = pgEnum("type", ["token", "model"]);

/**
 * Purchase Table - One-Time Payment Records
 *
 * Stores all one-time purchases (not subscriptions).
 * Integrates with Stripe for payment processing.
 *
 * Payment Flow:
 * 1. User initiates purchase (creates Stripe session)
 * 2. Record created with sessionId and status
 * 3. Stripe webhook updates paymentStatus
 * 4. Invoice generated and stored
 * 5. Tokens/models credited to user account
 */
export const purchaseTable = pgTable("payments", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(), // Stripe checkout session ID
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "set null", // Keep payment history even if user deleted
  }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"), // Total amount paid
  customerEmail: varchar("customer_email", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 100 }).notNull(), // 'paid', 'pending', 'failed'
  quantity: integer("quantity").notNull().default(0), // Number of tokens or models
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"), // Unit price
  planName: varchar("plan_name", { length: 255 }), // Name of token package
  invoiceId: varchar("invoice_id", { length: 255 }), // Stripe invoice ID
  type: typeEnum().notNull().default("token"), // 'token' or 'model'
  created: timestamp("created", { withTimezone: true }).notNull(), // Stripe creation timestamp
  invoiceUrl: text("invoice_url"), // Link to Stripe-hosted invoice
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Purchase Relations
 * Links payments to users
 */
export const purchaseTableRelations = relations(purchaseTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [purchaseTable.userId],
    references: [usersTable.id],
  }),
}));
