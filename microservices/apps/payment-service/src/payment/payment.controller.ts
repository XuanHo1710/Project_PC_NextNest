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
      guestId: string | null;
    },
  ) {
    return this.vnpayService.verifyPayment(
      data.orderCode,
      data.status,
      data.guestId,
    );
  }

  @MessagePattern('payment.createForCashOnDelivery')
  createPaymentForCOD(
    @Payload()
    data: {
      orderId: string;
      amount: number;
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
      status: 'PENDING' | 'PAID' | 'UNPAID' | 'EXPIRED';
    },
  ) {
    return this.vnpayService.updatePaymentStatus(data.orderId, data.status);
  }

  @MessagePattern('payment.expireByOrderId')
  expirePaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
  ) {
    return this.vnpayService.expirePaymentsByOrderId(data.orderId);
  }

  @MessagePattern('payment.getByOrderId')
  getPaymentsByOrderId(
    @Payload()
    data: {
      orderId: string;
    },
  ) {
    return this.vnpayService.getPaymentsByOrderId(data.orderId);
  }
}
