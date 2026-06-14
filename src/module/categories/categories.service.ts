import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { categoriesTable } from '../../db/schema/categories.schema';
import { eq } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async create(createCategoryDto: CreateCategoryDto) {
    const result = await db.insert(categoriesTable).values(createCategoryDto).returning();
    return result[0];
  }

  async findAll() {
    return db.query.categoriesTable.findMany({
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });
  }

  async findOne(id: number) {
    const category = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, id),
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id); // Check if exists
    
    const result = await db.update(categoriesTable)
      .set({ ...updateCategoryDto, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
      
    return result[0];
  }

  async remove(id: number) {
    const category = await this.findOne(id); // Check if exists
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    return { message: 'Category deleted successfully' };
  }
}
