import { Controller, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  private handleDlqOrRetry(
    channel: Channel,
    msg: ConsumeMessage,
    data: unknown,
  ) {
    const xDeath = msg.properties.headers?.['x-death'];
    const retryCount =
      xDeath?.find((d: any) => d.queue === 'notification.retry')?.count || 0;
    if (retryCount >= 5) {
      this.logger.error(
        `Max retries reached, routing to DLQ: ${JSON.stringify(data)}`,
      );
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

  @MessagePattern('notification.sendMail')
  async create(
    @Payload() data: { email: string; orderId: string; description: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.notificationService.sendMail(
        data.email,
        data.orderId,
        data.description,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      this.logger.error(`sendMail failed: ${error}`);
      this.handleDlqOrRetry(channel, msg, data);
      throw error;
    }
  }

  @MessagePattern('notification.sendOrderConfirmation')
  async sendOrderConfirmation(
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
      const result = await this.notificationService.sendOrderConfirmationEmail(
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
      this.logger.error(`sendOrderConfirmation failed: ${error}`);
      this.handleDlqOrRetry(channel, msg, data);
      throw error;
    }
  }

  @EventPattern('notification.sendOrderConfirmation')
  async handleOrderConfirmationEvent(
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
      await this.notificationService.sendOrderConfirmationEmail(
        data.email,
        data.orderId,
        data.amount,
        data.orderItems,
        data.paymentMethod,
        data.customerName,
        data.transactionId,
      );
      channel.ack(msg);
    } catch (error) {
      this.logger.error(`handleOrderConfirmationEvent failed: ${error}`);
      this.handleDlqOrRetry(channel, msg, data);
    }
  }

  @EventPattern('notification.sendVerificationEmail')
  async handleSendVerificationEmail(
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
    try {
      await this.notificationService.sendVerificationEmail(
        data.email,
        data.fullname,
        data.verificationToken,
      );
      channel.ack(msg);
    } catch (error) {
      this.logger.error(`handleSendVerificationEmail failed: ${error}`);
      this.handleDlqOrRetry(channel, msg, data);
    }
  }

  @MessagePattern('notification.sendVerificationEmail')
  async sendVerificationEmail(
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
    try {
      const result = await this.notificationService.sendVerificationEmail(
        data.email,
        data.fullname,
        data.verificationToken,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      this.logger.error(`sendVerificationEmail failed: ${error}`);
      this.handleDlqOrRetry(channel, msg, data);
      throw error;
    }
  }
}
