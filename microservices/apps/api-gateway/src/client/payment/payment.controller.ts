import { Controller, Get, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'decorators/customize';

@Controller('/client/payment')
export class PaymentController {
  constructor(
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentService.send('payment.findAll', {
      filter: {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search: search || '',
      },
    });
  }
}
