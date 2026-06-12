import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { menusTable } from '../../db/schema/menus.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MenusService {
  async createMenu(data: any) {
    const newMenu = await db.insert(menusTable).values(data).returning();
    return newMenu[0];
  }

  async getAllMenus() {
    return db.query.menusTable.findMany();
  }

  async updateMenu(id: number, data: any) {
    const updated = await db.update(menusTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menusTable.id, id))
      .returning();

    if (updated.length === 0) {
      throw new NotFoundException('Menu item not found');
    }
    return updated[0];
  }

  async deleteMenu(id: number) {
    const deleted = await db.delete(menusTable)
      .where(eq(menusTable.id, id))
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundException('Menu item not found');
    }
    return deleted[0];
  }
}
