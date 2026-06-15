import { Controller, Patch, Body, Param, ParseIntPipe, Get, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('Settings')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  async createUser(@Body() createDto: CreateUserDto) {
    return this.adminService.createUser(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAdminDto
  ) {
    return this.adminService.update(id, updateDto);
  }
}
