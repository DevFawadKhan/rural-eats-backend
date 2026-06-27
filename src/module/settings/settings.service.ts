import { Injectable } from '@nestjs/common';
import { db } from '../../db';
import { settingsTable } from '../../db/schema/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class SettingsService {
  async getSettings() {
    const settings = await db.query.settingsTable.findFirst();
    return settings || null;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.getSettings();
    if (!existing) {
      const inserted = await db.insert(settingsTable)
        .values({ ...dto, restaurantName: dto.restaurantName || '', updatedAt: new Date() })
        .returning();
      return inserted[0];
    }

    const updated = await db.update(settingsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(settingsTable.id, existing.id))
      .returning();
      
    return updated[0];
  }
}
