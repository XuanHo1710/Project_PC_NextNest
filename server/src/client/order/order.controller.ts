import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { UpdateOrderDto } from 'src/client/order/dto/update-order.dto';
import { CreateOrderDto } from 'src/client/order/dto/create-order.dto';

@Controller('/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Patch(':id')
  updateOrderStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrderStatus(id, updateOrderDto);
  }

  @Patch(':id')
  updateOrderPayment(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrderPayment(id, updateOrderDto);
  }
}
