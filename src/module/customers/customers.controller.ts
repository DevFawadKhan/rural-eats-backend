import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomerGuard } from '../auth/guards/customer.guard';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, CustomerGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.customersService.getProfile(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() updateDto: UpdateCustomerDto) {
    return this.customersService.updateProfile(req.user.id, updateDto);
  }
}
