import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../../db';
import { carouselSlidesTable } from '../../db/schema/carousel-slides.schema';
import { CreateCarouselSlideDto } from './dto/create-carousel-slide.dto';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class CarouselService {
  async getSlides() {
    return await db.select().from(carouselSlidesTable).orderBy(asc(carouselSlidesTable.sortOrder), asc(carouselSlidesTable.id));
  }

  async createSlide(dto: CreateCarouselSlideDto) {
    const inserted = await db.insert(carouselSlidesTable).values(dto).returning();
    return inserted[0];
  }

  async deleteSlide(id: number) {
    const deleted = await db.delete(carouselSlidesTable).where(eq(carouselSlidesTable.id, id)).returning();
    if (!deleted.length) {
      throw new NotFoundException(`Slide with ID ${id} not found`);
    }
    return { message: 'Slide deleted successfully' };
  }
}
