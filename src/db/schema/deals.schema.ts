import { pgTable, serial, varchar, text, boolean, numeric, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { menusTable } from './menus.schema';

export const dealsTable = pgTable('deals', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dealItemsTable = pgTable('deal_items', {
  id: serial('id').primaryKey(),
  dealId: integer('deal_id').references(() => dealsTable.id, { onDelete: 'cascade' }).notNull(),
  menuId: integer('menu_id').references(() => menusTable.id, { onDelete: 'cascade' }).notNull(),
  size: varchar('size', { length: 50 }),
});

export const dealsRelations = relations(dealsTable, ({ many }) => ({
  dealItems: many(dealItemsTable),
}));

export const dealItemsRelations = relations(dealItemsTable, ({ one }) => ({
  deal: one(dealsTable, {
    fields: [dealItemsTable.dealId],
    references: [dealsTable.id],
  }),
  menu: one(menusTable, {
    fields: [dealItemsTable.menuId],
    references: [menusTable.id],
  }),
}));
