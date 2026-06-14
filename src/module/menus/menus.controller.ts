import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

const storage = diskStorage({
  destination: './uploads/images/menus',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

const parseBoolean = (val: any, defaultVal: boolean): boolean => {
  if (val === undefined) return defaultVal;
  return val === 'true' || val === true;
};

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async getAll() {
    return this.menusService.getAllMenus();
  }

  @Post()
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  @UseInterceptors(FilesInterceptor('images', 5, { storage }))
  async create(@Body() createDto: CreateMenuDto, @UploadedFiles() files: Express.Multer.File[]) {
    const imagePaths = files ? files.map(file => `/uploads/images/menus/${file.filename}`) : [];
    
    const data = {
      name: createDto.name,
      categoryId: createDto.categoryId,
      description: createDto.description,
      isActive: parseBoolean(createDto.isActive, true),
      hasSizes: parseBoolean(createDto.hasSizes, false),
      standardPrice: createDto.standardPrice ? createDto.standardPrice.toString() : null,
      priceSmall: createDto.priceSmall ? createDto.priceSmall.toString() : null,
      priceMedium: createDto.priceMedium ? createDto.priceMedium.toString() : null,
      priceLarge: createDto.priceLarge ? createDto.priceLarge.toString() : null,
      images: imagePaths,
    };

    return this.menusService.createMenu(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  @UseInterceptors(FilesInterceptor('images', 5, { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMenuDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.categoryId !== undefined) updateData.categoryId = updateDto.categoryId;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    
    if (updateDto.isActive !== undefined) updateData.isActive = parseBoolean(updateDto.isActive, true);
    if (updateDto.hasSizes !== undefined) updateData.hasSizes = parseBoolean(updateDto.hasSizes, false);
    
    if (updateDto.standardPrice !== undefined) updateData.standardPrice = updateDto.standardPrice ? updateDto.standardPrice.toString() : null;
    if (updateDto.priceSmall !== undefined) updateData.priceSmall = updateDto.priceSmall ? updateDto.priceSmall.toString() : null;
    if (updateDto.priceMedium !== undefined) updateData.priceMedium = updateDto.priceMedium ? updateDto.priceMedium.toString() : null;
    if (updateDto.priceLarge !== undefined) updateData.priceLarge = updateDto.priceLarge ? updateDto.priceLarge.toString() : null;

    if (files && files.length > 0) {
      updateData.images = files.map(file => `/uploads/images/menus/${file.filename}`);
    }

    return this.menusService.updateMenu(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SuperadminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.deleteMenu(id);
  }
}
