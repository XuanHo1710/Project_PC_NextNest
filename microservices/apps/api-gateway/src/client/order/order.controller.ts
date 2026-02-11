import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { MICROSERVICE } from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'decorators/customize';

@Controller('/client/order')
export class OrderController {
  constructor(
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
  ) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.send('order.findAll', {
      filter: {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        search: search || '',
      },
    });
  }
}
