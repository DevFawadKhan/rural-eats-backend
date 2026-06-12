import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userPermissionsTable } from './user-permissions.schema';

export const permissionsTable = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const permissionsRelations = relations(permissionsTable, ({ many }) => ({
  userPermissions: many(userPermissionsTable),
}));
