import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { rolesTable } from './roles.schema';
import { permissionsTable } from './permissions.schema';

export const rolePermissionsTable = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').notNull().references(() => rolesTable.id),
  permissionId: integer('permission_id').notNull().references(() => permissionsTable.id),
});

export const rolePermissionsRelations = relations(rolePermissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [rolePermissionsTable.roleId],
    references: [rolesTable.id],
  }),
  permission: one(permissionsTable, {
    fields: [rolePermissionsTable.permissionId],
    references: [permissionsTable.id],
  }),
}));
