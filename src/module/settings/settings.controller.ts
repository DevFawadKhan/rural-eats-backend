import { Controller, Get, Patch, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { put } from '@vercel/blob';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

const storage = memoryStorage();

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return await this.settingsService.getSettings();
  }

  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Settings')
  @UseInterceptors(FileInterceptor('image', { storage }))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    const blob = await put(`logos/${filename}`, file.buffer, { access: 'public' });
    return { url: blob.url };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Settings')
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return await this.settingsService.updateSettings(dto);
  }
}
