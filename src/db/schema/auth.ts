/**
 * Authentication and User Management Schema
 *
 * Defines the complete authentication system including:
 * - User accounts and profiles
 * - OAuth provider accounts (Google, GitHub, etc.)
 * - Session management
 * - Email verification
 * - Password reset functionality
 *
 * This schema integrates with NextAuth.js for authentication and includes
 * custom fields for the application's business logic (tokens, models, subscriptions).
 */
import {
  timestamp,
  text,
  primaryKey,
  integer,
  serial,
  varchar,
  pgTable,
  pgEnum,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";
import z from "zod";
import { relations, sql } from "drizzle-orm";
import { userSubscriptionsTable } from "./user-subscription";
import { subscriptionHistoryTable } from "./subscription-history";
import { purchaseTable } from "./purchase";
import { companyTable } from "./company";
import { modelsTable } from "./models";
import { subModelTable } from "./sub-model";
import {
  notificationPreferences,
  NotificationPreferenceTableType,
} from "./notification-preference";
import { generateTable } from "./generate";
import { modelsToUsersTable } from "./models-to-users";

/**
 * User role enumeration
 * - admin: Full system access
 * - user: Standard user access
 * - agency: Agency-level access (for white-label features)
 */
export const roleEnum = pgEnum("role", ["admin", "user", "agency"]);

/**
 * User account status enumeration
 * - pending: Awaiting approval
 * - approved: Active account
 * - suspended: Temporarily disabled
 * - blocked: Permanently disabled
 */
export const statusEnum = pgEnum("status", [
  "pending",
  "approved",
  "suspended",
  "blocked",
]);

/**
 * Users Table - Core user account information
 *
 * Stores user profiles, authentication data, and application-specific fields.
 * Integrates with NextAuth.js for authentication while adding custom business logic.
 *
 * Token System:
 * - tokens: Current available tokens for generation
 * - totalTokens: Lifetime total tokens (for tracking)
 * - Uses numeric type for fractional token support (e.g., 0.5 tokens for restore)
 *
 * Stripe Integration:
 * - stripeCustomerId: Links to Stripe customer for payments
 * - subscriptionId: Current active subscription ID
 */
export const usersTable = pgTable("user", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text("name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"), // Null for OAuth users
  image: text("image"), // Profile picture URL
  phone: text("phone"),
  country: text("country"),
  language: text("language"), // User's preferred language
  role: roleEnum().notNull().default("user"),
  status: statusEnum().notNull().default("approved"),

  // Token management - using numeric for fractional tokens (e.g., 0.5 for image restore)
  tokens: numeric("tokens", { precision: 10, scale: 2 })
    .default("30")
    .notNull(),

  models: integer("models").notNull().default(0), // Number of custom models user can create

  // Total tokens ever received (for analytics)
  totalTokens: numeric("total_tokens", { precision: 10, scale: 2 })
    .default("30")
    .notNull(),

  // Stripe integration
  subscriptionId: varchar("subscription_id", { length: 255 }).default(""),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).default(""),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const accountsTable = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

/**
 * Sessions Table - Active User Sessions
 *
 * Manages user session tokens for NextAuth.js.
 * Sessions expire after a configured period for security.
 */
export const sessionsTable = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/**
 * Password Reset Tokens Table
 *
 * Stores one-time tokens for password reset functionality.
 * Tokens are single-use and expire after a short period.
 */
export const passwordResetTokensTable = pgTable("passwordResetToken", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  token: text("token").notNull().unique(), // One-time reset token
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * User Table Relations
 * Defines all relationships between users and other entities in the system
 */
export const usersTableRelations = relations(usersTable, ({ one, many }) => ({
  userSubscriptions: many(userSubscriptionsTable), // User's active subscriptions
  subscriptionHistory: many(subscriptionHistoryTable), // Historical subscription records
  userPurchases: many(purchaseTable), // Token purchase history
  models: many(modelsTable), // Custom models created by user
  subModels: many(subModelTable), // Sub-model requests
  company: one(companyTable), // Company/agency affiliation
  notificationPreference: one(notificationPreferences), // Notification settings
  generations: many(generateTable), // Generated content (images/videos)
  modelsToUsers: many(modelsToUsersTable), // Models assigned to user
}));

/**
 * Validation Schemas
 * Zod schemas for form validation and type safety
 */

// Sign-up form validation
export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Sign-in form validation
export const signInSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Forgot password form validation
export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
});

export const UserFormSchema = (isEdit?: boolean) =>
  z.object({
    name: z.string().min(2, {
      message: "Display name must be at least 2 characters.",
    }),
    email: isEdit
      ? z.email({
          message: "Please enter a valid email address.",
        })
      : z.email({
          message: "Please enter a valid email address.",
        }),
    password: isEdit
      ? z
          .string()
          .min(6, {
            message: "Password must be at least 6 characters.",
          })
          .optional()
      : z.string().min(6, {
          message: "Password must be at least 6 characters.",
        }),
    role: z.enum(["admin", "user", "agency"]),
    status: z.enum(["pending", "approved", "suspended", "blocked"]),
    // haveVoices: z.enum(['all', 'custom']),
    // assignedVoices: z.array(z.string()).optional(),
    // guestUser: z.boolean(),
    tokens: z.number().min(0, {
      message: "Credits must be a positive number.",
    }),
    models: z.number().min(0, {
      message: "Models must be a positive number.",
    }),
  });

// Type
export type UserFormType = z.infer<ReturnType<typeof UserFormSchema>>;
export type UserProfileUpdateType = z.infer<typeof profileSchema> & {
  image?: string;
};
export type UserTableType = typeof usersTable.$inferSelect & {
  notificationPreference?: NotificationPreferenceTableType | null;
};
