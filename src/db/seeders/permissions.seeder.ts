import { db } from '../index';
import { permissionsTable } from '../schema/permissions.schema';
import { eq } from 'drizzle-orm';

export const sidebarPermissions = [
  'Dashboard',
  'Orders',
  'Menu',
  'Categories',
  'Deals',
  'Customers',
  'Expenses',
  'Expense Categories',
  'Revenue',
  'Chats',
  'Customer Orders',
  'Settings',
  'Logs'
];

export async function seedPermissions() {
  try {
    console.log('Seeding permissions...');

    for (const permName of sidebarPermissions) {
      const existingPerm = await db.query.permissionsTable.findFirst({
        where: eq(permissionsTable.name, permName)
      });

      if (!existingPerm) {
        await db.insert(permissionsTable).values({
          name: permName,
          description: `Access to ${permName} screen`
        });
        console.log(`Inserted permission: ${permName}`);
      }
    }

    console.log('Permissions seeded successfully!');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  }
}

// Execute the seeder if run directly
if (require.main === module) {
  seedPermissions().then(() => process.exit(0)).catch(() => process.exit(1));
}
