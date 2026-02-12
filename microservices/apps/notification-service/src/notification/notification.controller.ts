import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from '@project-pc/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('notification.sendMail')
  create(
    @Payload() data: { email: string; orderId: string; description: string },
  ) {
    return this.notificationService.sendMail(
      data.email,
      data.orderId,
      data.description,
    );
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
  ) {
    return this.notificationService.sendOrderConfirmationEmail(
      data.email,
      data.orderId,
      data.amount,
      data.orderItems,
      data.paymentMethod,
      data.customerName,
      data.transactionId,
    );
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
  ) {
    return this.notificationService.sendOrderConfirmationEmail(
      data.email,
      data.orderId,
      data.amount,
      data.orderItems,
      data.paymentMethod,
      data.customerName,
      data.transactionId,
    );
  }
}
