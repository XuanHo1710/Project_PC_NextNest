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
      const verifyResult = this.vnpayService.createPaymentUrl(
        data.createPaymentDto,
        data.ip,
      );
      channel.ack(msg);
      return verifyResult;
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
    }
  }

  @MessagePattern('payment.verify')
  verifyPayment(
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
      const verifyResult = this.vnpayService.verifyPayment(
        data.orderCode,
        data.status,
        data.guestId,
      );
      channel.ack(msg);
      return verifyResult;
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
    }
  }

  @MessagePattern('payment.createForCashOnDelivery')
  createPaymentForCOD(
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
      const result = this.vnpayService.createPaymentForCashOnDelivery(
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
    }
  }

  @MessagePattern('payment.updateStatus')
  updatePaymentStatus(
    @Payload()
    data: {
      orderId: string;
      status: 'PENDING' | 'PAID' | 'UNPAID' | 'EXPIRED';
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.vnpayService.updatePaymentStatus(
      data.orderId,
      data.status,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('payment.expireByOrderId')
  expirePaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.vnpayService.expirePaymentsByOrderId(data.orderId);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('payment.getByOrderId')
  getPaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.vnpayService.getPaymentsByOrderId(data.orderId);
    channel.ack(msg);
    return result;
  }

  @MessagePattern('payment.refund')
  refundPayment(
    @Payload()
    data: {
      orderId: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.vnpayService.refundPayment(data.orderId);
    channel.ack(msg);
    return result;
  }
}
