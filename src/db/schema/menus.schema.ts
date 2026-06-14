import { pgTable, serial, varchar, text, boolean, numeric, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orderItemsTable } from './order-items.schema';
import { categoriesTable } from './categories.schema';

export const menusTable = pgTable('menus', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  categoryId: integer('category_id').references(() => categoriesTable.id),
  description: text('description'),
  images: text('images').array().notNull().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  hasSizes: boolean('has_sizes').default(false).notNull(),
  standardPrice: numeric('standard_price', { precision: 10, scale: 2 }),
  priceSmall: numeric('price_small', { precision: 10, scale: 2 }),
  priceMedium: numeric('price_medium', { precision: 10, scale: 2 }),
  priceLarge: numeric('price_large', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const menusRelations = relations(menusTable, ({ one, many }) => ({
  orderItems: many(orderItemsTable),
  category: one(categoriesTable, {
    fields: [menusTable.categoryId],
    references: [categoriesTable.id],
  }),
}));
