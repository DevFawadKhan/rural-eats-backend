import { pgTable, serial, varchar, numeric, integer, timestamp, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { expenseCategoriesTable } from './expense-categories.schema';

export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  categoryId: integer('category_id').references(() => expenseCategoriesTable.id).notNull(),
  expenseDate: date('expense_date').notNull(),
  attachmentUrl: varchar('attachment_url', { length: 1024 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  category: one(expenseCategoriesTable, {
    fields: [expensesTable.categoryId],
    references: [expenseCategoriesTable.id],
  }),
}));
