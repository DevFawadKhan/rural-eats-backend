import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { usersTable } from '../schema/users.schema';
import { db, pool } from '../index';

const seed = async () => {
  try {
    console.log('Seeding superadmin user...');
    const email = 'superadmin@gmail.com';
    const plainPassword = 'superadmin@123';

    // Check if superadmin already exists
    const existingSuperadmin = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    const superadminExists = existingSuperadmin.length > 0;

    if (superadminExists) {
      console.log('Superadmin user already exists.');
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    await db.insert(usersTable).values({
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'superadmin',
    });

    console.log('Superadmin user seeded successfully!');
  } catch (error) {
    console.error('Error seeding superadmin user:', error);
  } finally {
    await pool.end();
  }
};

seed();
