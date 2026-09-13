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
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  MICROSERVICE,
  UpdateOrderDto,
} from '@project-pc/common';
import { ClientProxy } from '@nestjs/microservices';
import { Guest } from 'decorators/customize';
import type { Request } from 'express';
import { firstValueFrom, catchError, throwError } from 'rxjs';

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
   * Helper: pipe RPC errors into HttpExceptions with proper messages.
   * Over TCP/RMQ thrown HttpExceptions arrive as plain objects like
   * { status:'error'|number, message } — normalize them here.
   */
  private rpcToHttp<T = any>(obs: ReturnType<ClientProxy['send']>): Promise<T> {
    return firstValueFrom(
      obs.pipe(
        catchError((err) => {
          const message =
            err?.message || err?.response?.message || 'Lỗi hệ thống';

          let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
          const rawStatus = err?.statusCode ?? err?.response?.statusCode ?? err?.status;
          if (typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus < 600) {
            status = rawStatus;
          } else if (err?.status === 'error' || err?.response) {
            // Business rejection from a microservice (stock, validation...)
            status = HttpStatus.BAD_REQUEST;
          }

          return throwError(
            () =>
              new HttpException({ message, statusCode: status }, status),
          );
        }),
      ),
    ) as Promise<T>;
  }

  /**
   * Create order via Saga Orchestrator.
   * The saga handles: order creation → payment/stock → notification
   * with compensating transactions on failure.
   */
  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
    @Guest() guest?: any,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Never trust client-supplied ownership when authenticated
    if (guest?._id && createOrderDto?.customerInfo) {
      createOrderDto.customerInfo.guestId = String(guest._id);
    }

    return this.rpcToHttp(
      this.sagaService.send('saga.order.create', {
        createOrderDto,
        ip,
      }),
    );
  }

  @Get('/guest/:guestId')
  async getOrdersByGuestId(
    @Guest() guest: any,
    @Param('guestId') _guestId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    return this.rpcToHttp(
      this.orderService.send('order.getAllByGuestId', {
        guestId: guest._id,
        requesterId: guest._id,
        page: page ? parseInt(page) : 1,
        limit: limit ? Math.min(parseInt(limit) || 10, 100) : 10,
        status: status || undefined,
      }),
    );
  }

  @Get('/pending-online/:guestId')
  async getPendingOnlineOrders(
    @Guest() guest: any,
    @Param('guestId') _guestId: string,
  ) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    return this.rpcToHttp(
      this.orderService.send('order.getPendingOnline', {
        guestId: guest._id,
        requesterId: guest._id,
      }),
    );
  }

  @Get('/:id')
  async getOrderById(@Guest() guest: any, @Param('id') id: string) {
    return this.rpcToHttp(
      this.orderService.send('order.getById', {
        orderId: id,
        guestId: guest?._id,
      }),
    );
  }

  @Post('/:id/retry-payment')
  async retryPayment(
    @Guest() guest: any,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.rpcToHttp(
      this.orderService.send('order.retryPayment', {
        orderId: id,
        ip,
        guestId: guest?._id,
      }),
    );
  }

  /**
   * Client: Update order status (for buyer actions like confirm received or cancel)
   */
  @Patch('/:id/status')
  async updateOrderStatus(
    @Guest() guest: any,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    return this.rpcToHttp(
      this.orderService.send('order.updateStatus', {
        id,
        updateOrderDto,
        requesterId: guest._id,
        isAdmin: false,
      }),
    );
  }

  /**
   * Seller: Get orders containing seller's products.
   * sellerId is ALWAYS derived from the JWT — clients cannot read another
   * seller's order stream by guessing ids.
   */
  @Get('/seller-orders/:sellerId')
  async getSellerOrders(
    @Guest() guest: any,
    @Param('sellerId') _sellerId: string,
    @Query('page') page?: string,
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    const sellerId = String(guest._id);

    // Step 1: Get product IDs for products created by this seller
    const productIds = await this.rpcToHttp<string[]>(
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
          itemsPerPage: Math.min(parseInt(limit) || 10, 100),
        },
      };
    }

    // Step 2: Get orders containing those product IDs
    return this.rpcToHttp(
      this.orderService.send('order.getByProductIds', {
        productIds,
        page: page ? parseInt(page) : 1,
        limit: limit ? Math.min(parseInt(limit) || 10, 100) : 10,
        status: status || undefined,
        search: search || undefined,
      }),
    );
  }
}
