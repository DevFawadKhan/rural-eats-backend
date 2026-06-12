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
    
    let isAvailable = true;
    if (createDto.isAvailable !== undefined) {
      isAvailable = createDto.isAvailable === 'true' || createDto.isAvailable === true;
    }

    const data = {
      name: createDto.name,
      description: createDto.description,
      price: createDto.price.toString(),
      isAvailable,
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
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.price !== undefined) updateData.price = updateDto.price.toString();
    if (updateDto.isAvailable !== undefined) {
      updateData.isAvailable = updateDto.isAvailable === 'true' || updateDto.isAvailable === true;
    }

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
