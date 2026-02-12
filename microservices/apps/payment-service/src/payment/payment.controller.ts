import { Controller } from '@nestjs/common';
import { VnpayService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePaymentDto } from '@project-pc/common';
@Controller()
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  // Luồng đặt hàng
  // 1. Tạo đơn hàng mới với trạng thái "pending"
  // 2.1 Tạo payment nếu khách hàng chọn thanh toán online => thành công => cập nhật payment thành PAID. Nếu fail thì quay lại bước 1
  //  payment: {
  //   isCheckout: true;
  //   type: 'CARD';
  // };
  // 2.2 Tạo payment nếu khách hàng chọn thanh toán khi nhận hàng => cập nhật payment thành UNPAID. Nếu fail thì quay lại bước 1
  //  payment: {
  //   isCheckout: false;
  //   type: 'CASH';
  // };
  // 3. Gửi thông báo qua email cho khách hàng (Notification Service). Nếu fail thì quay lại bước 2
  // 4. Cập nhật số lượng tồn kho. Nếu fail thì quay lại bước 3
  // 5. Cập nhật trạng thái đơn hàng thành "SHIPPING". Nếu fail thì quay lại bước 4
  //
  //
  // 6. Cập nhật trạng thái đơn hàng thành "DELIVERED" khi khách hàng nhận được hàng
  // và cập nhật payment thành PAID nếu khách hàng thanh toán khi nhận hàng

  @MessagePattern('payment.create')
  createVnpayPaymentUrl(
    @Payload() data: { createPaymentDto: CreatePaymentDto; ip: string },
  ) {
    return this.vnpayService.createPaymentUrl(data.createPaymentDto, data.ip);
  }

  // @MessagePattern('payment.verify')
  // handleVnpayReturn(@Payload() data: { query: any; guestId: string }) {
  //   return this.vnpayService.verifyReturnUrl(data.query, data.guestId);
  // }

  @MessagePattern('payment.createForCashOnDelivery')
  createPaymentForCOD(@Payload() data: { orderId: string; amount: number }) {
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
