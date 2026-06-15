import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rolePermissionsTable } from './role-permissions.schema';
import { usersTable } from './users.schema';

export const rolesTable = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  rolePermissions: many(rolePermissionsTable),
  users: many(usersTable),
}));
