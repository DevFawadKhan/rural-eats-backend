import { pgTable, serial, integer, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { customersTable } from './customers.schema';
import { orderItemsTable } from './order-items.schema';
import { usersTable } from './users.schema';

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customersTable.id),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  createdByUserId: integer('created_by_user_id').references(() => usersTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [ordersTable.customerId],
    references: [customersTable.id],
  }),
  createdByUser: one(usersTable, {
    fields: [ordersTable.createdByUserId],
    references: [usersTable.id],
  }),
  orderItems: many(orderItemsTable),
}));
