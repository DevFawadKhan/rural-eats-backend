import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('guest-orders')
export class GuestOrdersController {
  private readonly logger = new Logger(GuestOrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

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
}
