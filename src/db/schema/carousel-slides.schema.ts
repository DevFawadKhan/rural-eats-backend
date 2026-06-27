import { pgTable, serial, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const carouselSlidesTable = pgTable('carousel_slides', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
