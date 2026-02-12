import { Controller } from '@nestjs/common';
import { VnpayService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePaymentDto } from '@project-pc/common';

@Controller()
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  @MessagePattern('payment.create')
  createVnpayPaymentUrl(
    @Payload() data: { createPaymentDto: CreatePaymentDto; ip: string },
  ) {
    return this.vnpayService.createPaymentUrl(data.createPaymentDto, data.ip);
  }

  @MessagePattern('payment.verify')
  verifyPayment(
    @Payload()
    data: {
      orderCode: number;
      status: string;
      customerEmail: string;
      orderItems: Array<{
        productVariant: string;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
    },
  ) {
    return this.vnpayService.verifyPayment(
      data.orderCode,
      data.status,
      data.customerEmail,
      data.orderItems,
    );
  }

  @MessagePattern('payment.createForCashOnDelivery')
  createPaymentForCOD(
    @Payload()
    data: {
      orderId: string;
      amount: number;
      guestId: string;
    },
  ) {
    return this.vnpayService.createPaymentForCashOnDelivery(
      data.orderId,
      data.amount,
    );
  }

  @MessagePattern('payment.updateStatus')
  updatePaymentStatus(
    @Payload()
    data: {
      orderId: string;
      status: 'PENDING' | 'PAID' | 'UNPAID';
    },
  ) {
    return this.vnpayService.updatePaymentStatus(data.orderId, data.status);
  }
}
