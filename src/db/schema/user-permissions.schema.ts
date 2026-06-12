import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usersTable } from './users.schema';
import { permissionsTable } from './permissions.schema';

export const userPermissionsTable = pgTable('user_permissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  permissionId: integer('permission_id').notNull().references(() => permissionsTable.id),
});

export const userPermissionsRelations = relations(userPermissionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userPermissionsTable.userId],
    references: [usersTable.id],
  }),
  permission: one(permissionsTable, {
    fields: [userPermissionsTable.permissionId],
    references: [permissionsTable.id],
  }),
}));
