import { db } from '../index';
import { rolesTable } from '../schema/roles.schema';
import { rolePermissionsTable } from '../schema/role-permissions.schema';
import { permissionsTable } from '../schema/permissions.schema';
import { eq, and } from 'drizzle-orm';

export async function seedAdminPermissions() {
  try {
    console.log('Assigning all permissions to the Admin role...');

    // 1. Ensure the "Admin" role exists
    const adminRole = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, 'Admin'),
    });

    if (!adminRole) {
      console.log('Error: Admin role not found. Please create it first.');
      return;
    }

    // 2. Fetch all permissions available in the system
    const allPermissions = await db.query.permissionsTable.findMany();
    
    if (allPermissions.length === 0) {
      console.log('No permissions found in the database. Please run permissions seeder first.');
      return;
    }

    let addedCount = 0;

    // 3. Assign each permission to the Admin role
    for (const perm of allPermissions) {
      const existingLink = await db.query.rolePermissionsTable.findFirst({
        where: and(
          eq(rolePermissionsTable.roleId, adminRole.id),
          eq(rolePermissionsTable.permissionId, perm.id)
        )
      });

      if (!existingLink) {
        await db.insert(rolePermissionsTable).values({
          roleId: adminRole.id,
          permissionId: perm.id
        });
        addedCount++;
        console.log(`Granted '${perm.name}' permission to Admin.`);
      }
    }

    console.log(`\nSuccessfully assigned ${addedCount} new permissions to the Admin role!`);
    
  } catch (error) {
    console.error('Error assigning permissions to Admin:', error);
  } finally {
    process.exit(0);
  }
}

seedAdminPermissions();
