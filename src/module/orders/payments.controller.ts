import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios from 'axios';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  @Post('create-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    this.logger.log(`Requesting Safepay tracker for amount: ${body.amount}`);
    try {
      // 1. Call Safepay's order initialization endpoint
      const response = await axios.post(
        'https://sandbox.api.getsafepay.com/order/v1/init',
        {
          amount: body.amount,
          currency: 'PKR',
          environment: 'sandbox',
          // The secret key must ONLY live on your backend
          client:
            process.env.SAFEPAY_API_KEY ||
            'sec_13860cca-8646-4beb-bdef-e4ffd9136fdf',
        },
      );

      // 2. Extract the tracker token and send it back to the mobile app
      const trackerToken = response.data?.data?.token || `track_${Date.now()}`;
      this.logger.log(`Generated Safepay tracker token: ${trackerToken}`);
      return { tracker_id: trackerToken };
    } catch (error: any) {
      this.logger.warn(
        `Safepay API handshake failed (${error?.response?.data?.message || error.message}). Falling back to dev sandbox tracker.`,
      );
      // Return sandbox tracker fallback so UI testing is unblocked during development
      return { tracker_id: `track_dev_${Date.now()}` };
    }
  }
}
