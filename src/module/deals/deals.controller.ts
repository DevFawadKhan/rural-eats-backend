import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { put } from '@vercel/blob';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

const storage = memoryStorage();

const parseBoolean = (val: any, defaultVal: boolean): boolean => {
  if (val === undefined) return defaultVal;
  return val === 'true' || val === true;
};

const parseDealItems = (val: any): { menuId: number, size: string | null }[] => {
  if (!val) return [];
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        menuId: parseInt(item.menuId),
        size: item.size || null
      })).filter(item => !isNaN(item.menuId));
    }
  } catch (e) {
    console.error('Failed to parse deal items:', e);
  }
  return [];
};

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  async getAll() {
    return this.dealsService.getAllDeals();
  }

  @Post()
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(@Body() createDto: CreateDealDto, @UploadedFile() file: Express.Multer.File) {
    let imagePath: string | null = null;
    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}${extname(file.originalname)}`;
      const blob = await put(`deals/${filename}`, file.buffer, { access: 'public' });
      imagePath = blob.url;
    }
    
    const data = {
      name: createDto.name,
      description: createDto.description,
      price: createDto.price.toString(),
      isActive: parseBoolean(createDto.isActive, true),
      image: imagePath,
    };

    const dealItems = parseDealItems(createDto.dealItems);

    return this.dealsService.createDeal(data, dealItems);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  @UseInterceptors(FileInterceptor('image', { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDealDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.price !== undefined) updateData.price = updateDto.price.toString();
    if (updateDto.isActive !== undefined) updateData.isActive = parseBoolean(updateDto.isActive, true);

    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}${extname(file.originalname)}`;
      const blob = await put(`deals/${filename}`, file.buffer, { access: 'public' });
      updateData.image = blob.url;
    }

    const dealItems = updateDto.dealItems !== undefined ? parseDealItems(updateDto.dealItems) : undefined;

    return this.dealsService.updateDeal(id, updateData, dealItems);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.dealsService.deleteDeal(id);
  }
}
