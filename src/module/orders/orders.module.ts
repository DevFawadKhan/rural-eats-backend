import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SafepayController } from './safepay.controller';
import { GuestOrdersController } from './guest-orders.controller';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [OrdersController, SafepayController, GuestOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
