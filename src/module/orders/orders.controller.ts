import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('revenue')
  @RequirePermissions('Revenue')
  async getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ordersService.getRevenueStats(startDate, endDate);
  }

  @Get()
  @RequirePermissions('Orders')
  async getAll() {
    return this.ordersService.getAllOrders();
  }

  @Post()
  @RequirePermissions('Orders')
  async create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.createOrder(createDto);
  }

  @Patch(':id')
  @RequirePermissions('Orders')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('Orders')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deleteOrder(id);
  }
}
