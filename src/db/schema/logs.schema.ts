import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users.schema';

export const logsTable = pgTable('logs', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => usersTable.id), // Nullable for anonymous actions
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const logsRelations = relations(logsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [logsTable.userId],
    references: [usersTable.id],
  }),
}));
