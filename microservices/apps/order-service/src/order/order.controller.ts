import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from '@project-pc/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ConsumeMessage, Channel } from 'amqplib';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Legacy: creates order + handles payment/stock/notification (tightly coupled).
   * Kept for backward compatibility. New flow uses saga.order.create via Saga Orchestrator.
   */
  @MessagePattern('order.create')
  async createOrder(
    @Payload() data: { createOrderDto: CreateOrderDto; ip: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;

    try {
      const orderCreated = await this.orderService.createOrder(
        data.createOrderDto,
        data.ip,
      );
      channel.ack(msg);
      return orderCreated;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'order.retry')?.count || 0;

      if (retryCount >= 5) {
        channel.publish(
          'order.dlx.exchange',
          'order.dlx',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  /**
   * Saga pattern: creates ONLY the order record in DB (no payment/stock/notification).
   * Called by Saga Orchestrator Service.
   */
  @MessagePattern('order.createRecord')
  async createRecord(
    @Payload() data: { createOrderDto: CreateOrderDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const orderCreated = await this.orderService.createRecord(
        data.createOrderDto,
      );
      channel.ack(msg);
      return orderCreated;
    } catch (error) {
      const xDeath = msg.properties.headers?.['x-death'];
      const retryCount =
        xDeath?.find((d) => d.queue === 'order.retry')?.count || 0;

      if (retryCount >= 5) {
        channel.publish(
          'order.dlx.exchange',
          'order.dlx',
          Buffer.from(JSON.stringify(data)),
          { persistent: true },
        );
        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  }

  /**
   * Saga compensation: cancel an order (set status to CANCELLED).
   * Called by Saga Orchestrator when a subsequent step fails.
   */
  @MessagePattern('order.cancel')
  async cancelOrder(
    @Payload() data: { orderId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.cancelOrder(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getById')
  async getOrderById(
    @Payload() data: { orderId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getOrderById(data.orderId);
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  /**
   * Admin: Get all orders with pagination and filters.
   */
  @MessagePattern('order.getAll')
  async getAllOrders(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      status?: string;
      paymentType?: string;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getAllOrders(data);
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getAllByGuestId')
  async getAllOrdersByGuestId(
    @Payload()
    data: {
      guestId: string;
      page?: number;
      limit?: number;
      status?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getAllOrdersByGuestId(
        data.guestId,
        data.page,
        data.limit,
        data.status,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getPendingOnline')
  async getPendingOnlineOrders(
    @Payload() data: { guestId: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getPendingOnlineOrders(
        data.guestId,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.retryPayment')
  async retryPayment(
    @Payload() data: { orderId: string; ip: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.retryPayment(
        data.orderId,
        data.ip,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.updateStatus')
  async updateOrderStatus(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.updateOrderStatus(
        data.id,
        data.updateOrderDto,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.updatePayment')
  async updateOrderPayment(
    @Payload() data: { id: string; updateOrderDto: UpdateOrderDto },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.updateOrderPayment(
        data.id,
        data.updateOrderDto,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getByVariantIds')
  async getOrdersByVariantIds(
    @Payload()
    data: {
      variantIds: string[];
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getOrdersByVariantIds(
        data.variantIds,
        data.page,
        data.limit,
        data.status,
        data.search,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getByProductIds')
  async getOrdersByProductIds(
    @Payload()
    data: {
      productIds: string[];
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getOrdersByProductIds(
        data.productIds,
        data.page,
        data.limit,
        data.status,
        data.search,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.getStats')
  async getOrderStats(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.getOrderStats();
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }

  @MessagePattern('order.adminHandleRejection')
  async adminHandleRejection(
    @Payload()
    data: {
      id: string;
      action: 'approve' | 'reject';
      refund?: boolean;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const msg = context.getMessage() as ConsumeMessage;
    try {
      const result = await this.orderService.adminHandleRejection(
        data.id,
        data.action,
        data.refund ?? false,
      );
      channel.ack(msg);
      return result;
    } catch (error) {
      channel.nack(msg, false, false);
      throw error;
    }
  }
}
