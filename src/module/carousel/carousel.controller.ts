import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { put } from '@vercel/blob';
import { CarouselService } from './carousel.service';
import { CreateCarouselSlideDto } from './dto/create-carousel-slide.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

const storage = memoryStorage();

@Controller('carousel')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Get()
  async getSlides() {
    return await this.carouselService.getSlides();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Settings')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    const blob = await put(`carousel/${filename}`, file.buffer, { access: 'public' });
    return { url: blob.url };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Settings')
  async createSlide(@Body() dto: CreateCarouselSlideDto) {
    return await this.carouselService.createSlide(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Settings')
  async deleteSlide(@Param('id', ParseIntPipe) id: number) {
    return await this.carouselService.deleteSlide(id);
  }
}
