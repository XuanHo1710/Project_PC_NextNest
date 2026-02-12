import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('order.create')
  createOrder(@Payload() data: { createOrderDto: CreateOrderDto; ip: string }) {
    return this.orderService.createOrder(data.createOrderDto, data.ip);
  }

  @MessagePattern('order.getById')
  getOrderById(@Payload() data: { orderId: string }) {
    return this.orderService.getOrderById(data.orderId);
  }

  @MessagePattern('order.getAllByGuestId')
  getAllOrdersByGuestId(@Payload() data: { guestId: string }) {
    return this.orderService.getAllOrdersByGuestId(data.guestId);
  }

  @MessagePattern('order.updateStatus')
  updateOrderStatus(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    return this.orderService.updateOrderStatus(data.id, data.updateOrderDto);
  }

  @MessagePattern('order.updatePayment')
  updateOrderPayment(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    return this.orderService.updateOrderPayment(data.id, data.updateOrderDto);
  }
}
