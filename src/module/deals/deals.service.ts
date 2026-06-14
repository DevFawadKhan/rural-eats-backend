import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { dealsTable, dealItemsTable } from '../../db/schema/deals.schema';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class DealsService {
  async createDeal(data: any, dealItems: { menuId: number, size: string | null }[]) {
    return db.transaction(async (tx) => {
      // Create Deal
      const newDeal = await tx.insert(dealsTable).values(data).returning();
      const dealId = newDeal[0].id;

      // Link Menu Items
      if (dealItems && dealItems.length > 0) {
        const dealItemsData = dealItems.map((item) => ({
          dealId,
          menuId: item.menuId,
          size: item.size
        }));
        await tx.insert(dealItemsTable).values(dealItemsData);
      }

      return newDeal[0];
    });
  }

  async getAllDeals() {
    return db.query.dealsTable.findMany({
      with: {
        dealItems: {
          with: {
            menu: true
          }
        }
      }
    });
  }

  async updateDeal(id: number, data: any, dealItems?: { menuId: number, size: string | null }[]) {
    return db.transaction(async (tx) => {
      // Update basic fields if any
      let updatedDeal: any = null;
      if (Object.keys(data).length > 0) {
        const updated = await tx.update(dealsTable)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(dealsTable.id, id))
          .returning();
          
        if (updated.length === 0) {
          throw new NotFoundException('Deal not found');
        }
        updatedDeal = updated[0];
      }

      // Update linked items if dealItems provided
      if (dealItems) {
        // Clear old ones
        await tx.delete(dealItemsTable).where(eq(dealItemsTable.dealId, id));
        // Insert new ones
        if (dealItems.length > 0) {
          const dealItemsData = dealItems.map((item) => ({
            dealId: id,
            menuId: item.menuId,
            size: item.size
          }));
          await tx.insert(dealItemsTable).values(dealItemsData);
        }
      }

      return updatedDeal || { id, ...data };
    });
  }

  async deleteDeal(id: number) {
    const deleted = await db.delete(dealsTable)
      .where(eq(dealsTable.id, id))
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundException('Deal not found');
    }
    return deleted[0];
  }
}
