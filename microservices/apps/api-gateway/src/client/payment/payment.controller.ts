import { Controller, Get, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Guest } from 'decorators/customize';

@Controller('/client/payment')
export class PaymentController {
  constructor(
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  @Get('/verify-vnpay')
  verifyVnpay(@Query() query: any, @Guest() guest: any) {
    return this.paymentService.send('payment.verify', {
      query: query,
      guestId: guest._id,
    });
  }
}
