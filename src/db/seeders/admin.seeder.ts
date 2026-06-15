import { db } from '../index';
import { usersTable } from '../schema/users.schema';
import { rolesTable } from '../schema/roles.schema';
import { rolePermissionsTable } from '../schema/role-permissions.schema';
import { permissionsTable } from '../schema/permissions.schema';
import * as bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';

export async function seedAdmin() {
  try {
    console.log('Seeding admin user...');
    const email = 'admin@gmail.com';
    const plainPassword = 'admin@123';

    // 1. Ensure the "Admin" role exists
    let adminRole = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, 'Admin'),
    });

    if (!adminRole) {
      console.log('Admin role not found, creating it...');
      const newRole = await db
        .insert(rolesTable)
        .values({
          name: 'Admin',
        })
        .returning();
      adminRole = newRole[0];
    }

    // 2. Assign all permissions to Admin role
    const allPermissions = await db.query.permissionsTable.findMany();
    for (const perm of allPermissions) {
      const existingLink = await db.query.rolePermissionsTable.findFirst({
        where: and(eq(rolePermissionsTable.roleId, adminRole.id), eq(rolePermissionsTable.permissionId, perm.id))
      });
      if (!existingLink) {
        await db.insert(rolePermissionsTable).values({
          roleId: adminRole.id,
          permissionId: perm.id
        });
      }
    }

    // 3. Check if admin already exists
    const existingAdmin = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating roleId if necessary...');
      if (existingAdmin.roleId !== adminRole.id) {
        await db.update(usersTable)
          .set({ roleId: adminRole.id })
          .where(eq(usersTable.id, existingAdmin.id));
        console.log('Updated admin user roleId.');
      } else {
        console.log('Permissions were verified.');
      }
      return;
    }

    // 4. Create the admin user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    await db.insert(usersTable).values({
      name: 'System Admin',
      email,
      passwordHash,
      roleId: adminRole.id,
    });

    console.log('Admin user and permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// Execute the seeder if run directly
if (require.main === module) {
  seedAdmin().then(() => process.exit(0)).catch(() => process.exit(1));
}
