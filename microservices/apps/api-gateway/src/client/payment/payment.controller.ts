import { Controller, Post, Body, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Guest } from 'decorators/customize';

@Controller('/client/payment')
export class PaymentController {
  constructor(
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  @Post('/verify')
  verifyPayment(
    @Body()
    body: {
      orderCode: number;
      status: string;
    },
    @Guest() guest: any,
  ) {
    return this.paymentService.send('payment.verify', {
      orderCode: body.orderCode,
      status: body.status,
      guestId: guest?._id || null,
    });
  }
}
