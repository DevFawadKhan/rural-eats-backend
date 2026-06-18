import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { menusTable } from '../../db/schema/menus.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MenusService {
  async createMenu(data: typeof menusTable.$inferInsert) {
    const [newMenu] = await db.insert(menusTable).values(data).returning();
    return newMenu;
  }

  async getAllMenus() {
    return db.query.menusTable.findMany({
      with: {
        category: true,
      }
    });
  }

  async getMenuById(id: number) {
    const menu = await db.query.menusTable.findFirst({
      where: eq(menusTable.id, id),
      with: {
        category: true,
      }
    });
    if (!menu) {
      throw new NotFoundException('Menu item not found');
    }
    return menu;
  }

  async updateMenu(id: number, data: Partial<typeof menusTable.$inferInsert>) {
    const [updatedMenu] = await db.update(menusTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menusTable.id, id))
      .returning();

    if (!updatedMenu) {
      throw new NotFoundException('Menu item not found');
    }
    return updatedMenu;
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
