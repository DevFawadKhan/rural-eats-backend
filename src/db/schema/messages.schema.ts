import { pgTable, serial, integer, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { customersTable } from './customers.schema';
import { usersTable } from './users.schema';

export const senderTypeEnum = pgEnum('sender_type', ['customer', 'admin']);
export const messageStatusEnum = pgEnum('message_status', [
  'sent',
  'delivered',
  'read',
]);

export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customersTable.id, { onDelete: 'cascade' })
    .notNull(),
  senderType: senderTypeEnum('sender_type').notNull(),
  senderId: integer('sender_id'), // Can be null if we don't strictly track the admin who sent it, or customer ID.
  text: text('text').notNull(),
  status: messageStatusEnum('message_status').notNull().default('sent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { relations } from 'drizzle-orm';

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  customer: one(customersTable, {
    fields: [messagesTable.customerId],
    references: [customersTable.id],
  }),
}));
