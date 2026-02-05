import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from './auth';
import { modelsTable } from './models';
import { relations } from 'drizzle-orm';

export const modelsToUsersTable = pgTable(
  'models_to_users',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    modelId: uuid('model_id')
      .notNull()
      .references(() => modelsTable.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.modelId] })]
);

// Relations
export const modelsToUsersRelations = relations(
  modelsToUsersTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [modelsToUsersTable.userId],
      references: [usersTable.id],
    }),
    model: one(modelsTable, {
      fields: [modelsToUsersTable.modelId],
      references: [modelsTable.id],
    }),
  })
);
