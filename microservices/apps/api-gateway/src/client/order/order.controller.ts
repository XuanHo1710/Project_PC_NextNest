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
import { Public } from 'decorators/customize';
import type { Request } from 'express';

@Controller('/client/order')
export class OrderController {
  constructor(
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
  ) {}

  @Post('/create')
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.orderService.send('order.create', { createOrderDto, ip });
  }
}
