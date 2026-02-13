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

  @Get('stats')
  getOrderStats() {
    return this.orderService.send('order.getStats', {});
  }

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

  /**
   * Admin handles seller rejection request for online payment orders.
   * action: 'approve' (cancel + optionally refund) or 'reject' (back to COMPLETED)
   */
  @Patch(':id/handle-rejection')
  handleRejection(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; refund?: boolean },
  ) {
    return this.orderService.send('order.adminHandleRejection', {
      id,
      action: body.action,
      refund: body.refund ?? false,
    });
  }

  /**
   * Admin updates order status directly
   */
  @Patch(':id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: UpdateOrderDto) {
    return this.orderService.send('order.updateStatus', {
      id,
      updateOrderDto: body,
    });
  }
}
