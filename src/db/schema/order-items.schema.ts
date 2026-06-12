import { pgTable, serial, integer, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ordersTable } from './orders.schema';
import { menusTable } from './menus.schema';

export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => ordersTable.id),
  menuId: integer('menu_id').notNull().references(() => menusTable.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.orderId],
    references: [ordersTable.id],
  }),
  menu: one(menusTable, {
    fields: [orderItemsTable.menuId],
    references: [menusTable.id],
  }),
}));
