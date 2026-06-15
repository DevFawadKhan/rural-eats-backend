import { Injectable } from '@nestjs/common';
import { db } from '../../db';
import { settingsTable } from '../../db/schema/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class SettingsService {
  async getSettings() {
    let settings = await db.query.settingsTable.findFirst();
    
    if (!settings) {
      const inserted = await db.insert(settingsTable).values({
        restaurantName: 'RuralEats',
      }).returning();
      settings = inserted[0];
    }
    
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.getSettings();
    const updated = await db.update(settingsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(settingsTable.id, existing.id))
      .returning();
      
    return updated[0];
  }
}
