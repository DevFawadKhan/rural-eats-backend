import { Controller, Get, Post, Body } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getRoles() {
    return await this.rolesService.getAllRoles();
  }

  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.rolesService.createRole(dto);
  }

  @Get('permissions')
  async getPermissions() {
    return await this.rolesService.getPermissionsList();
  }
}
