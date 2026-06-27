import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('revenue')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Revenue')
  async getRevenue(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ordersService.getRevenueStats(startDate, endDate);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Orders')
  async getAll() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Order with ID #${id} not found`);
    }
    return order;
  }

  @Post()
  async create(@Body() createDto: CreateOrderDto) {
    return this.ordersService.createOrder(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Orders')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('Orders')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deleteOrder(id);
  }
}
