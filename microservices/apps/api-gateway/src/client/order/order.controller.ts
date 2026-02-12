import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { CreateOrderDto, MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Guest, Public } from 'decorators/customize';
import type { Request } from 'express';

@Controller('/client/order')
export class OrderController {
  constructor(
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
  ) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.orderService.send('order.create', { createOrderDto, ip });
  }

  @Get('/guest/:guestId')
  getOrdersByGuestId(
    @Param('guestId') guestId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.send('order.getAllByGuestId', {
      guestId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status: status || undefined,
    });
  }

  @Get('/pending-online/:guestId')
  getPendingOnlineOrders(@Param('guestId') guestId: string) {
    return this.orderService.send('order.getPendingOnline', { guestId });
  }

  @Get('/:id')
  getOrderById(@Param('id') id: string) {
    return this.orderService.send('order.getById', { orderId: id });
  }

  @Post('/:id/retry-payment')
  retryPayment(@Param('id') id: string, @Req() req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.orderService.send('order.retryPayment', { orderId: id, ip });
  }
}
