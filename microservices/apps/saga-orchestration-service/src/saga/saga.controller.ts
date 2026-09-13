import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from '@project-pc/common';
import { SagaService } from 'src/saga/saga.service';

@Controller()
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  /**
   * Saga Orchestration: Create Order
   *
   * Orchestrates the order creation flow with compensating transactions:
   *
   * CARD flow:
   *   Step 1: Create order record → order-service
   *   Step 2: Create payment link → payment-service
   *   (Stock decremented later when payment is verified)
   *
   * COD flow:
   *   Step 1: Create order record → order-service
   *   Step 2: Decrement stock → product-service (for each item)
   *   Step 3: Send notification → notification-service (non-critical)
   *
   * On failure at any step, compensating transactions run in reverse order.
   */
  @MessagePattern('saga.order.create')
  createOrder(
    @Payload()
    data: { createOrderDto: CreateOrderDto; ip: string; orderId?: string },
  ) {
    return this.sagaService.createOrderSaga(
      data.createOrderDto,
      data.ip,
      data.orderId,
    );
  }
}
