import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userPermissionsTable } from './user-permissions.schema';
import { logsTable } from './logs.schema';
import { ordersTable } from './orders.schema';

export const userRoleEnum = pgEnum('user_role', ['admin', 'superadmin']);

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  userPermissions: many(userPermissionsTable),
  logs: many(logsTable),
  createdOrders: many(ordersTable),
}));
