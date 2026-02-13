import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Legacy: creates order + handles payment/stock/notification (tightly coupled).
   * Kept for backward compatibility. New flow uses saga.order.create via Saga Orchestrator.
   */
  @MessagePattern('order.create')
  createOrder(@Payload() data: { createOrderDto: CreateOrderDto; ip: string }) {
    return this.orderService.createOrder(data.createOrderDto, data.ip);
  }

  /**
   * Saga pattern: creates ONLY the order record in DB (no payment/stock/notification).
   * Called by Saga Orchestrator Service.
   */
  @MessagePattern('order.createRecord')
  createRecord(@Payload() data: { createOrderDto: CreateOrderDto }) {
    return this.orderService.createRecord(data.createOrderDto);
  }

  /**
   * Saga compensation: cancel an order (set status to CANCELLED).
   * Called by Saga Orchestrator when a subsequent step fails.
   */
  @MessagePattern('order.cancel')
  cancelOrder(@Payload() data: { orderId: string }) {
    return this.orderService.cancelOrder(data.orderId);
  }

  @MessagePattern('order.getById')
  getOrderById(@Payload() data: { orderId: string }) {
    return this.orderService.getOrderById(data.orderId);
  }

  /**
   * Admin: Get all orders with pagination and filters.
   */
  @MessagePattern('order.getAll')
  getAllOrders(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      status?: string;
      paymentType?: string;
      search?: string;
    },
  ) {
    return this.orderService.getAllOrders(data);
  }

  @MessagePattern('order.getAllByGuestId')
  getAllOrdersByGuestId(
    @Payload()
    data: {
      guestId: string;
      page?: number;
      limit?: number;
      status?: string;
    },
  ) {
    return this.orderService.getAllOrdersByGuestId(
      data.guestId,
      data.page,
      data.limit,
      data.status,
    );
  }

  @MessagePattern('order.getPendingOnline')
  getPendingOnlineOrders(@Payload() data: { guestId: string }) {
    return this.orderService.getPendingOnlineOrders(data.guestId);
  }

  @MessagePattern('order.retryPayment')
  retryPayment(@Payload() data: { orderId: string; ip: string }) {
    return this.orderService.retryPayment(data.orderId, data.ip);
  }

  @MessagePattern('order.updateStatus')
  updateOrderStatus(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    console.log(data.updateOrderDto);
    return this.orderService.updateOrderStatus(data.id, data.updateOrderDto);
  }

  @MessagePattern('order.updatePayment')
  updateOrderPayment(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
  ) {
    return this.orderService.updateOrderPayment(data.id, data.updateOrderDto);
  }

  @MessagePattern('order.getByVariantIds')
  getOrdersByVariantIds(
    @Payload()
    data: {
      variantIds: string[];
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    },
  ) {
    return this.orderService.getOrdersByVariantIds(
      data.variantIds,
      data.page,
      data.limit,
      data.status,
      data.search,
    );
  }

  @MessagePattern('order.getByProductIds')
  getOrdersByProductIds(
    @Payload()
    data: {
      productIds: string[];
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    },
  ) {
    return this.orderService.getOrdersByProductIds(
      data.productIds,
      data.page,
      data.limit,
      data.status,
      data.search,
    );
  }

  @MessagePattern('order.getStats')
  getOrderStats() {
    return this.orderService.getOrderStats();
  }
}
