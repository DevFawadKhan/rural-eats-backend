import { Controller, Patch, Body, Param, ParseIntPipe, Get, UseGuards } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { UpdateSuperadminDto } from './dto/update-superadmin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from '../auth/guards/superadmin.guard';

@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperadminGuard)
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Get('users')
  async findAllUsers() {
    return this.superadminService.findAllUsers();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSuperadminDto
  ) {
    return this.superadminService.update(id, updateDto);
  }
}
