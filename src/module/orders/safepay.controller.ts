import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { db } from '../../db';
import { ordersTable } from '../../db/schema/orders.schema';
import { logsTable } from '../../db/schema/logs.schema';
import { eq } from 'drizzle-orm';

@Controller('safepay-webhook')
export class SafepayController {
  private readonly logger = new Logger(SafepayController.name);

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: any,
    @Headers() allHeaders: any,
    @Headers('x-sfpy-signature') sfpySig?: string,
    @Headers('x-safepay-signature') safepaySig?: string,
  ) {
    this.logger.log(
      `Received Safepay webhook headers: ${JSON.stringify(allHeaders)}`,
    );
    this.logger.log(
      `Received Safepay webhook payload: ${JSON.stringify(body)}`,
    );

    const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;
    const signature =
      sfpySig ||
      safepaySig ||
      allHeaders?.['x-sfpy-sig'] ||
      allHeaders?.['sfpy-signature'] ||
      body?.sig ||
      body?.signature;

    // Optional signature verification if secret is set and signature is provided
    if (webhookSecret && signature && typeof body === 'object') {
      try {
        const hmac = crypto.createHmac('sha256', webhookSecret);
        const computed = hmac.update(JSON.stringify(body)).digest('hex');
        if (computed !== signature && signature !== webhookSecret) {
          this.logger.warn(
            `Signature mismatch. Received: ${signature}, Computed: ${computed}`,
          );
        } else {
          this.logger.log('Webhook signature verified successfully.');
        }
      } catch (err: any) {
        this.logger.error(`Error verifying signature: ${err.message}`);
      }
    }

    // Also check direct secret match if passed in payload
    if (body?.secret && webhookSecret && body.secret !== webhookSecret) {
      this.logger.warn(
        'Webhook payload secret does not match environment secret.',
      );
    }

    // Log the event in logs table
    try {
      await db.insert(logsTable).values({
        action: 'SAFEPAY_WEBHOOK_RECEIVED',
        details: body || {},
      });
    } catch (dbErr: any) {
      this.logger.error(`Failed to record webhook log: ${dbErr.message}`);
    }

    // Process transaction status
    const state =
      body?.state ||
      body?.status ||
      body?.event?.type ||
      body?.data?.state;
    const reference =
      body?.reference ||
      body?.order_id ||
      body?.orderId ||
      body?.data?.reference ||
      body?.metadata?.order_id;

    const isPaid =
      state === 'PAID' ||
      state === 'SUCCESS' ||
      state === 'paid' ||
      state === 'success' ||
      state === 'payment:completed';

    if (reference && isPaid) {
      const orderId = parseInt(reference.toString(), 10);
      if (!isNaN(orderId)) {
        const paymentChannel = body?.payment_method || body?.provider || body?.metadata?.channel || body?.data?.payment_method || 'Safepay Online';
        this.logger.log(`Updating order #${orderId} status to 'Confirmed' via ${paymentChannel}`);
        try {
          await db
            .update(ordersTable)
            .set({ status: 'Confirmed', paymentMethod: paymentChannel.toString(), updatedAt: new Date() })
            .where(eq(ordersTable.id, orderId));

          await db.insert(logsTable).values({
            action: 'ORDER_PAYMENT_CONFIRMED',
            details: {
              orderId,
              provider: 'safepay',
              status: 'Confirmed',
              tracker: body?.tracker || body?.data?.tracker,
            },
          });
        } catch (updateErr: any) {
          this.logger.error(
            `Failed to update order status for order #${orderId}: ${updateErr.message}`,
          );
        }
      } else {
        this.logger.warn(
          `Webhook reference '${reference}' is not a valid numeric order ID.`,
        );
      }
    } else {
      this.logger.log(
        `Webhook processed without order status change. State: ${state}, Reference: ${reference}`,
      );
    }

    return { status: 'success', message: 'Webhook processed' };
  }
}
