import { pgTable, serial, integer, varchar, numeric, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { customersTable } from './customers.schema';
import { orderItemsTable } from './order-items.schema';
import { usersTable } from './users.schema';

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull().references(() => customersTable.id),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('COD').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  isTakeaway: boolean('is_takeaway').default(false).notNull(),
  specialInstructions: varchar('special_instructions', { length: 1000 }),
  landmark: varchar('landmark', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  deliveryAddress: varchar('delivery_address', { length: 500 }),
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
