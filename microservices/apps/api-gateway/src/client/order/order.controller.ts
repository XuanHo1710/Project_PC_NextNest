import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
  Post,
  Body,
  Req,
  Patch,
} from '@nestjs/common';
import {
  CreateOrderDto,
  MICROSERVICE,
  UpdateOrderDto,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Guest, Public } from 'decorators/customize';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('/client/order')
export class OrderController {
  constructor(
    @Inject(MICROSERVICE.ORDER_SERVICE)
    private readonly orderService: ClientProxy,
    @Inject(MICROSERVICE.SAGA_ORCHESTRATOR_SERVICE)
    private readonly sagaService: ClientProxy,
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  /**
   * Create order via Saga Orchestrator.
   * The saga handles: order creation → payment/stock → notification
   * with compensating transactions on failure.
   */
  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.sagaService.send('saga.order.create', {
      createOrderDto,
      ip,
    });
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

  /**
   * Client: Update order status (for buyer actions like confirm received or cancel)
   */
  @Patch('/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.send('order.updateStatus', {
      id,
      updateOrderDto,
    });
  }

  /**
   * Seller: Get orders containing seller's products.
   * Uses product IDs (stable) instead of variant IDs (can change on recreate).
   */
  @Get('/seller-orders/:sellerId')
  async getSellerOrders(
    @Param('sellerId') sellerId: string,
    @Query('page') page?: string,
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    // Step 1: Get product IDs for products created by this seller
    const productIds = await firstValueFrom(
      this.productService.send('product.getProductIdsByCreator', {
        createdBy: sellerId,
      }),
    );

    if (!productIds || productIds.length === 0) {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit) || 10,
        },
      };
    }

    // Step 2: Get orders containing those product IDs
    return this.orderService.send('order.getByProductIds', {
      productIds,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      status: status || undefined,
      search: search || undefined,
    });
  }
}
