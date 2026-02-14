import { Controller } from '@nestjs/common';
import { VnpayService } from './payment.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreatePaymentDto } from '@project-pc/common';
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  @MessagePattern('payment.create')
  async createVnpayPaymentUrl(
    @Payload() data: { createPaymentDto: CreatePaymentDto; ip: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.vnpayService.createPaymentUrl(
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
      const result = await this.vnpayService.verifyPayment(
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
      const result = await this.vnpayService.createPaymentForCashOnDelivery(
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
      const result = await this.vnpayService.updatePaymentStatus(
        data.orderId,
        data.status,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
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
      const result = await this.vnpayService.expirePaymentsByOrderId(
        data.orderId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
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
      const result = await this.vnpayService.getPaymentsByOrderId(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
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
      const result = await this.vnpayService.refundPayment(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }
}
