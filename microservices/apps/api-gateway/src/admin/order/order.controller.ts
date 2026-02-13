import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE, UpdateOrderDto } from '@project-pc/common';

@Controller('/admin/order')
export class OrderController {
  constructor(
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('paymentType') paymentType?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.send('order.getAll', {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status: status || undefined,
      paymentType: paymentType || undefined,
      search: search || undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.send('order.getById', { orderId: id });
  }

  /**
   * Admin COD confirm: create a PAID payment record for COD order
   */
  @Patch(':id/confirm-cod')
  confirmCodPayment(@Param('id') id: string, @Body() body: { amount: number }) {
    return this.paymentService.send('payment.createForCashOnDelivery', {
      orderId: id,
      amount: body.amount,
    });
  }
}
