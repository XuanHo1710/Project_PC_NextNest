import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from '@project-pc/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Channel, ConsumeMessage } from 'amqplib';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.sendMail')
  create(
    @Payload() data: { email: string; orderId: string; description: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const verifyResult = this.notificationService.sendMail(
        data.email,
        data.orderId,
        data.description,
      );
      channel.ack(msg);
      return verifyResult;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'notification.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'notification.dlx.exchange',
          'notification.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  @MessagePattern('notification.sendOrderConfirmation')
  sendOrderConfirmation(
    @Payload()
    data: {
      email: string;
      orderId: string;
      amount: number;
      orderItems: Array<{
        productVariant: string;
        productName?: string;
        combination?: Record<string, string>;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
      paymentMethod: string;
      customerName?: string;
      transactionId?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = this.notificationService.sendOrderConfirmationEmail(
        data.email,
        data.orderId,
        data.amount,
        data.orderItems,
        data.paymentMethod,
        data.customerName,
        data.transactionId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'notification.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'notification.dlx.exchange',
          'notification.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  @EventPattern('notification.sendOrderConfirmation')
  handleOrderConfirmationEvent(
    @Payload()
    data: {
      email: string;
      orderId: string;
      amount: number;
      orderItems: Array<{
        productVariant: string;
        productName?: string;
        combination?: Record<string, string>;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
      paymentMethod: string;
      customerName?: string;
      transactionId?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = this.notificationService.sendOrderConfirmationEmail(
        data.email,
        data.orderId,
        data.amount,
        data.orderItems,
        data.paymentMethod,
        data.customerName,
        data.transactionId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'notification.retry')?.count || 0;
      if (retryCount >= 5) {
        channel.publish(
          'notification.dlx.exchange',
          'notification.dlq',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  @EventPattern('notification.sendVerificationEmail')
  handleSendVerificationEmail(
    @Payload()
    data: {
      email: string;
      fullname: string;
      verificationToken: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.notificationService.sendVerificationEmail(
      data.email,
      data.fullname,
      data.verificationToken,
    );
    channel.ack(msg);
    return result;
  }

  @MessagePattern('notification.sendVerificationEmail')
  sendVerificationEmail(
    @Payload()
    data: {
      email: string;
      fullname: string;
      verificationToken: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    const result = this.notificationService.sendVerificationEmail(
      data.email,
      data.fullname,
      data.verificationToken,
    );
    channel.ack(msg);
    return result;
  }
}
