import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { expensesTable } from './expenses.schema';

export const expenseCategoriesTable = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expenseCategoriesRelations = relations(
  expenseCategoriesTable,
  ({ many }) => ({
    expenses: many(expensesTable),
  }),
);
