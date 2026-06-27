import { Controller, Post, Body, Logger, Patch, Param, ParseIntPipe, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/create-order.dto';

@Controller('guest-orders')
export class GuestOrdersController {
  private readonly logger = new Logger(GuestOrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get(':id')
  async getGuestOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id);
  }

  @Post()
  async createGuestOrder(@Body() createDto: CreateOrderDto) {
    this.logger.log(`Received guest order request: ${JSON.stringify(createDto)}`);
    const order = await this.ordersService.createOrder(createDto);
    
    return {
      status: 'success',
      message: 'Order created successfully. Ready for Safepay payment integration.',
      order,
      safepayPaymentConfig: {
        currency: 'PKR',
        environment: 'sandbox',
        webhookUrl: 'https://rural-eats-backend.vercel.app/safepay-webhook',
        reference: order?.id?.toString() || '1',
      }
    };
  }

  @Patch(':id')
  async updateGuestOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    this.logger.log(`Updating guest order #${id}: ${JSON.stringify(updateDto)}`);
    return this.ordersService.updateOrder(id, updateDto);
  }
}
