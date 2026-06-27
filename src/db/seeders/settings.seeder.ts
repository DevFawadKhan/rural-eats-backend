import { db } from '../index';
import { settingsTable } from '../schema/settings.schema';
import { eq } from 'drizzle-orm';

export async function seedSettings() {
  try {
    console.log('Seeding settings data...');

    const seedData = {
      restaurantName: 'RuralEats',
      email: 'ruraleats@gmail.com',
      phone: '03498925304',
      whatsappNumber: '03392111228',
      address: 'islamabad pakistan',
      logoUrl: '/logo/Golden Crisp Logo.png',
      updatedAt: new Date(),
    };

    const existing = await db.query.settingsTable.findFirst();

    if (existing) {
      await db.update(settingsTable)
        .set(seedData)
        .where(eq(settingsTable.id, existing.id));
      console.log('Updated existing settings successfully!');
    } else {
      await db.insert(settingsTable).values(seedData);
      console.log('Inserted new settings successfully!');
    }
  } catch (error) {
    console.error('Error seeding settings:', error);
  }
}

if (require.main === module) {
  seedSettings().then(() => process.exit(0)).catch(() => process.exit(1));
}
