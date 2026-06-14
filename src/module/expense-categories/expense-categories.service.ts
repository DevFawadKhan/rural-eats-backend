import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { expenseCategoriesTable } from '../../db/schema/expense-categories.schema';
import { eq } from 'drizzle-orm';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  async create(createDto: CreateExpenseCategoryDto) {
    const result = await db.insert(expenseCategoriesTable).values(createDto).returning();
    return result[0];
  }

  async findAll() {
    return db.query.expenseCategoriesTable.findMany({
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });
  }

  async findOne(id: number) {
    const category = await db.query.expenseCategoriesTable.findFirst({
      where: eq(expenseCategoriesTable.id, id),
    });
    if (!category) {
      throw new NotFoundException(`Expense Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateDto: UpdateExpenseCategoryDto) {
    const category = await this.findOne(id);
    
    const result = await db.update(expenseCategoriesTable)
      .set({ ...updateDto, updatedAt: new Date() })
      .where(eq(expenseCategoriesTable.id, id))
      .returning();
      
    return result[0];
  }

  async remove(id: number) {
    await this.findOne(id);
    await db.delete(expenseCategoriesTable).where(eq(expenseCategoriesTable.id, id));
    return { message: 'Expense Category deleted successfully' };
  }
}
