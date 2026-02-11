import { Controller } from '@nestjs/common';
import { VnpayService } from './payment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PaymentController {
  constructor(private readonly vnpayService: VnpayService) {}

  @MessagePattern('payment.create')
  createVnpayPaymentUrl(@Payload() createPaymentDto) {
    return this.vnpayService.createPaymentUrl(createPaymentDto);
  }

  @MessagePattern('payment.verify')
  handleVnpayReturn(@Payload() query: any) {
    return this.vnpayService.verifyReturnUrl(query);
  }
}
