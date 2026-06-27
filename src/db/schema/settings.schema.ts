import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const settingsTable = pgTable('settings', {
  id: serial('id').primaryKey(),
  restaurantName: varchar('restaurant_name', { length: 255 }).notNull().default('RuralEats'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: varchar('address', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
