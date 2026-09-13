import { Body, Controller, Post } from '@nestjs/common';
import { PayosService } from './payment.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreatePaymentDto } from '@project-pc/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly payosService: PayosService) {}

  @Public()
  @Post('payos-webhook')
  async payosWebhook(@Body() body: any) {
    return await this.payosService.handlePayosWebhook(body);
  }

  @MessagePattern('payment.create')
  async createVnpayPaymentUrl(
    @Payload() data: { createPaymentDto: CreatePaymentDto; ip: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.createPaymentUrl(
        data.createPaymentDto,
        data.ip,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'payment.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'payment.dlx.exchange',
          'payment.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
      throw error;
    }
  }

  @MessagePattern('payment.verify')
  async verifyPayment(
    @Payload()
    data: {
      orderCode: number;
      status: string;
      guestId: string | null;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.verifyPayment(
        data.orderCode,
        data.status,
        data.guestId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'payment.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'payment.dlx.exchange',
          'payment.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
      throw error;
    }
  }

  @MessagePattern('payment.createForCashOnDelivery')
  async createPaymentForCOD(
    @Payload()
    data: {
      orderId: string;
      amount: number;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.createPaymentForCashOnDelivery(
        data.orderId,
        data.amount,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'payment.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'payment.dlx.exchange',
          'payment.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
      throw error;
    }
  }

  @MessagePattern('payment.updateStatus')
  async updatePaymentStatus(
    @Payload()
    data: {
      orderId: string;
      status: 'PENDING' | 'PAID' | 'UNPAID' | 'EXPIRED';
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.updatePaymentStatus(
        data.orderId,
        data.status,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      this.deadLetterOrRetry(channel, msg, data);
      throw error;
    }
  }

  @MessagePattern('payment.expireByOrderId')
  async expirePaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.expirePaymentsByOrderId(
        data.orderId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      this.deadLetterOrRetry(channel, msg, data);
      throw error;
    }
  }

  @MessagePattern('payment.expireByOrderIds')
  async expirePaymentsByOrderIds(
    @Payload()
    data: {
      orderIds: string[];
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.expirePaymentsByOrderIds(
        data.orderIds,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      this.deadLetterOrRetry(channel, msg, data);
      throw error;
    }
  }

  @MessagePattern('payment.getByOrderId')
  async getPaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.getPaymentsByOrderId(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      this.deadLetterOrRetry(channel, msg, data);
      throw error;
    }
  }

  @MessagePattern('payment.refund')
  async refundPayment(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.payosService.refundPayment(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      this.deadLetterOrRetry(channel, msg, data);
      throw error;
    }
  }

  /**
   * Mirrors the payment.create x-death counting convention:
   * each failure dead-letters into payment.retry (5s TTL) and returns to
   * payment.main; after 3 retries the message is published to the DLQ.
   */
  private deadLetterOrRetry(
    channel: Channel,
    msg: ConsumeMessage,
    data: unknown,
  ) {
    const xDeath = msg.properties.headers?.['x-death'];
    const retryCount =
      xDeath?.find((d) => d.queue === 'payment.retry')?.count || 0;

    if (retryCount >= 3) {
      channel.publish(
        'payment.dlx.exchange',
        'payment.dlq',
        Buffer.from(JSON.stringify(data)),
        { persistent: true },
      );
      channel.ack(msg);
    } else {
      channel.nack(msg, false, false);
    }
  }
}
