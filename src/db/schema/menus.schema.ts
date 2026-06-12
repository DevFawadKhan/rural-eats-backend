import { pgTable, serial, varchar, text, boolean, numeric, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orderItemsTable } from './order-items.schema';

export const menusTable = pgTable('menus', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  images: text('images').array().notNull().default([]),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const menusRelations = relations(menusTable, ({ many }) => ({
  orderItems: many(orderItemsTable),
}));
