import { relations, sql } from 'drizzle-orm';
import { integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import z from 'zod';
import { usersTable } from './auth';

export const companyTable = pgTable('company', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  companyName: varchar('company_name', { length: 255 }),
  companyWebsite: varchar('company_website', { length: 255 }),
  companyDescription: text('company_description'),
  companyIndustry: varchar('company_industry', { length: 255 }),
  companyNumber: varchar('company_number', { length: 255 }),
});

// Relations
export const companyTableRelations = relations(companyTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [companyTable.userId],
    references: [usersTable.id],
  }),
}));

// Schema
export const companySchema = z.object({
  companyName: z.string().optional(),
  companyWebsite: z
    .union([z.url('Invalid URL format'), z.literal('')])
    .optional(),
  companyDescription: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyNumber: z.string().optional(),
});

// Types
export type CompanyUpdateType = z.infer<typeof companySchema>;
