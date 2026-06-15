import { Controller, Get, Patch, Body, UseGuards, Request, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerGuard } from '../auth/guards/customer.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async getAllCustomers() {
    return this.customersService.getAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async getProfile(@Request() req: any) {
    return this.customersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  async updateProfile(@Request() req: any, @Body() updateDto: UpdateCustomerDto) {
    return this.customersService.updateProfile(req.user.id, updateDto);
  }

  @Post('guest')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Customers')
  async createGuest(@Body() body: { name: string; phoneNumber: string; address?: string; city?: string; email?: string }) {
    return this.customersService.createGuest(body);
  }
}
