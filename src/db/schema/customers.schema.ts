import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable } from './orders.schema';

export const customersTable = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  isGuest: boolean('is_guest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

import { messagesTable } from './messages.schema';

export const customersRelations = relations(customersTable, ({ many }) => ({
  orders: many(ordersTable),
  messages: many(messagesTable),
}));
