import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateOrderDto,
  MICROSERVICE,
  ProductVariant,
  UpdateOrderDto,
} from '@project-pc/common';
import { Order } from 'src/order/entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['COMPLETED', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'PENDING_REJECTION'],
  COMPLETED: ['SHIPPING', 'CANCELLED'],
  PENDING_REJECTION: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
  EXPIRED: [],
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(ProductVariant.name)
    private readonly productVariantModel: Model<ProductVariant>,
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  /**
   * Server-side re-pricing: never trust client-sent price/subtotal.
   * Validates quantities and resolves every ProductVariant from the DB,
   * then builds the trusted order snapshot + totalAmount from DB values.
   */
  private async buildValidatedOrderData(createOrderDto: CreateOrderDto) {
    const items = (createOrderDto.orderDetail || []) as any[];

    if (!items.length) {
      throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
    }

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException(
          'Số lượng sản phẩm không hợp lệ (phải là số nguyên >= 1)',
        );
      }
    }

    const variantIds = [
      ...new Set(items.map((item) => String(item.productVariant?._id || ''))),
    ];
    const variants = await this.productVariantModel
      .find({
        _id: {
          $in: variantIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id)),
        },
      })
      .lean();
    const variantMap = new Map(variants.map((v) => [String(v._id), v]));

    let totalAmount = 0;
    const orderDetail = items.map((item) => {
      const variantId = String(item.productVariant?._id || '');
      const variant = variantMap.get(variantId);
      if (!variant) {
        throw new BadRequestException(`Sản phẩm không tồn tại: ${variantId}`);
      }
      const price = Number(variant.price ?? 0);
      const quantity = Number(item.quantity);
      const subtotal = price * quantity;
      totalAmount += subtotal;

      return {
        // Snapshot variant info (lưu trực tiếp)
        variantId,
        productId: item.product?._id || '',
        sku: variant.sku || '',
        variantPrice: price,
        discount: Number(variant.discount ?? 0),
        images: variant.images || [],
        combination: item.productVariant?.combination || {},
        // Product info
        productName: item.product?.name || '',
        // Order item info — computed server-side
        quantity,
        price,
        subtotal,
      };
    });

    return { orderDetail, totalAmount };
  }

  async createOrder(createOrderDto: CreateOrderDto, ip: string) {
    try {
      const isOnlinePayment = createOrderDto.payment.type === 'CARD';

      const { orderDetail, totalAmount } =
        await this.buildValidatedOrderData(createOrderDto);

      const dataCreate: any = {
        customerInfo: {
          guestId: new Types.ObjectId(createOrderDto.customerInfo.guestId),
          fullname: createOrderDto.customerInfo.fullname,
          address: createOrderDto.customerInfo.address,
          email: createOrderDto.customerInfo.email,
          phone: createOrderDto.customerInfo.phone,
          note: createOrderDto.customerInfo.note,
        },
        orderDetail,
        totalAmount,
        payment: {
          isCheckout: createOrderDto.payment.isCheckout,
          type: createOrderDto.payment.type,
        },
      };

      // For CARD orders: set expireAt to 24 hours from now
      if (isOnlinePayment) {
        dataCreate.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else {
        // COD orders: set status to COMPLETED immediately
        dataCreate.status = 'COMPLETED';
      }

      const order = await this.orderModel.create(dataCreate);

      if (isOnlinePayment) {
        // Online payment: create PayOS payment link + payment record
        const createPaymentDto = {
          order: order._id.toString(),
          amount: order.totalAmount,
          guestId: createOrderDto.customerInfo.guestId,
        };
        const paymentResult = await firstValueFrom(
          this.paymentService.send('payment.create', {
            createPaymentDto,
            ip,
          }),
        );

        return {
          orderId: order._id.toString(),
          url: paymentResult.url,
          orderCode: paymentResult.orderCode,
          paymentType: 'CARD',
        };
      } else {
        // COD payment: NO payment record created yet
        // Payment record for COD is created when seller confirms money received

        // Update stock for COD orders immediately (single bulk call).
        // All-or-nothing contract: on failure NOTHING was decremented, so we
        // remove the freshly created order and surface the real reason.
        const stockItems = createOrderDto.orderDetail.map((item) => ({
          variantId: String(item.productVariant._id),
          quantity: item.quantity,
        }));
        let stockResult: any;
        try {
          stockResult = await firstValueFrom(
            this.productService.send('product.variant.decrementStockBulk', {
              items: stockItems,
            }),
          );
        } catch (err) {
          await this.orderModel.findByIdAndDelete(order._id);
          throw new Error(`Không cập nhật được tồn kho cho đơn hàng: ${err?.message || err}`);
        }

        if (!stockResult?.success) {
          await this.orderModel.findByIdAndDelete(order._id);
          throw new Error(
            stockResult?.message ||
              `Sản phẩm không đủ hàng: ${(stockResult?.failedVariantIds || []).join(', ')}`,
          );
        }

        // Send COD order confirmation email (fire and forget)
        this.notificationService.emit('notification.sendOrderConfirmation', {
          email: createOrderDto.customerInfo.email,
          orderId: order._id.toString(),
          amount: order.totalAmount,
          orderItems: order.orderDetail.map((item) => ({
            productVariant: item.variantId,
            productName: item.productName,
            combination: item.combination || {},
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
          paymentMethod: 'COD',
          customerName: createOrderDto.customerInfo.fullname,
        });

        return {
          orderId: order._id.toString(),
          paymentType: 'COD',
          totalAmount: order.totalAmount,
          customerInfo: order.customerInfo,
        };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Saga pattern: Create ONLY the order record in DB.
   * No payment creation, no stock decrement, no notification.
   * Called by Saga Orchestrator Service.
   */
  async createRecord(createOrderDto: CreateOrderDto) {
    const isOnlinePayment = createOrderDto.payment.type === 'CARD';

    const { orderDetail, totalAmount } =
      await this.buildValidatedOrderData(createOrderDto);

    const dataCreate: any = {
      customerInfo: {
        guestId: new Types.ObjectId(createOrderDto.customerInfo.guestId),
        fullname: createOrderDto.customerInfo.fullname,
        address: createOrderDto.customerInfo.address,
        email: createOrderDto.customerInfo.email,
        phone: createOrderDto.customerInfo.phone,
        note: createOrderDto.customerInfo.note,
      },
      orderDetail,
      totalAmount,
      payment: {
        isCheckout: createOrderDto.payment.isCheckout,
        type: createOrderDto.payment.type,
      },
    };

    if (isOnlinePayment) {
      dataCreate.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // COD orders: set status to COMPLETED immediately
      dataCreate.status = 'COMPLETED';
    }

    const order = await this.orderModel.create(dataCreate);
    return order;
  }

  /**
   * Saga compensation: Cancel an order (set status to CANCELLED).
   * Called by Saga Orchestrator when a subsequent step fails.
   */
  async cancelOrder(orderId: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status: 'CANCELLED' },
      { new: true },
    );
    return order;
  }

  /**
   * Retry payment for an existing PENDING/EXPIRED online order
   * Creates a new payment record (new attempt) and returns new PayOS link
   */
  async retryPayment(orderId: string, ip: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    if (order.payment.type !== 'CARD') {
      throw new Error('Đơn hàng này không phải thanh toán online');
    }

    if (!['PENDING', 'EXPIRED'].includes(order.status)) {
      throw new Error('Đơn hàng không ở trạng thái cho phép thanh toán lại');
    }

    // EXPIRED orders had their stock restored by the expiry cron — re-decrement
    // before allowing a new payment attempt, otherwise payment succeeds with
    // stock never deducted (overselling).
    if (order.status === 'EXPIRED') {
      const stockItems = order.orderDetail.map((item: any) => ({
        variantId: String(item.variantId ?? item.productVariant?._id),
        quantity: item.quantity,
      }));
      const stockResult: any = await firstValueFrom(
        this.productService.send('product.variant.decrementStockBulk', {
          items: stockItems,
        }),
      );
      if (!stockResult?.success) {
        throw new Error(
          stockResult?.message ||
            `Sản phẩm không đủ hàng để thanh toán lại: ${(stockResult?.failedVariantIds || []).join(', ')}`,
        );
      }
    }

    // Reset order status back to PENDING + extend expireAt
    order.status = 'PENDING';
    order.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await order.save();

    // Create new payment record (new attempt)
    const createPaymentDto = {
      order: order._id.toString(),
      amount: order.totalAmount,
      guestId: order.customerInfo.guestId.toString(),
    };
    const paymentResult = await firstValueFrom(
      this.paymentService.send('payment.create', {
        createPaymentDto,
        ip,
      }),
    );

    return {
      orderId: order._id.toString(),
      url: paymentResult.url,
      orderCode: paymentResult.orderCode,
      paymentType: 'CARD',
    };
  }

  /**
   * Get all PENDING online orders for a guest (awaiting payment)
   */
  async getPendingOnlineOrders(guestId: string) {
    const orders = await this.orderModel
      .find({
        'customerInfo.guestId': new Types.ObjectId(guestId),
        'payment.type': 'CARD',
        status: { $in: ['PENDING', 'EXPIRED'] },
      })
      .sort({ createdAt: -1 })
      .lean();
    return orders;
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    return order;
  }

  /**
   * Ownership guard: khi cả requesterId và guestId được cung cấp thì phải khớp nhau.
   */
  assertOrderOwnership(
    requesterId?: string | null,
    targetGuestId?: string | null,
  ) {
    const requester = requesterId ? String(requesterId) : '';
    const target = targetGuestId ? String(targetGuestId) : '';
    if (requester && target && requester !== target) {
      throw new UnauthorizedException('Không có quyền truy cập đơn hàng');
    }
  }

  /**
   * Admin: Get all orders with pagination, status, payment type, and search filters.
   */
  async getAllOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentType?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, paymentType, search } = params;
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (paymentType && paymentType !== 'ALL') {
      query['payment.type'] = paymentType;
    }
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { 'customerInfo.fullname': { $regex: s, $options: 'i' } },
        { 'customerInfo.email': { $regex: s, $options: 'i' } },
        { 'customerInfo.phone': { $regex: s, $options: 'i' } },
      ];
      // If search looks like an ObjectId, also search by _id
      if (/^[0-9a-fA-F]{24}$/.test(s)) {
        query.$or.push({ _id: new Types.ObjectId(s) });
      }
    }

    const totalItems = await this.orderModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const items = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async getAllOrdersByGuestId(
    guestId: string,
    page = 1,
    limit = 10,
    status?: string,
  ) {
    const query: any = { 'customerInfo.guestId': new Types.ObjectId(guestId) };
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const [items, totalItems] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async updateOrderStatus(
    id: string,
    updateOrderDto: UpdateOrderDto,
    isAdmin = false,
  ) {
    const nextStatus = updateOrderDto.status;

    if (!nextStatus || !ORDER_STATUS_TRANSITIONS.hasOwnProperty(nextStatus)) {
      throw new BadRequestException(`Trạng thái không hợp lệ: ${nextStatus}`);
    }

    const order = await this.orderModel.findById(new Types.ObjectId(id));
    if (!order) {
      throw new Error('Đơn hàng không tồn tại');
    }

    if (!isAdmin && nextStatus !== 'CANCELLED') {
      throw new ForbiddenException(
        'Chỉ admin được phép thực hiện chuyển trạng thái này',
      );
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (order.status !== nextStatus && !allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${order.status} sang ${nextStatus}`,
      );
    }

    const updateData: any = { status: nextStatus };
    if (updateOrderDto.reason !== undefined) {
      updateData.reason = updateOrderDto.reason;
    }

    // Seller rejects CARD order → PENDING_REJECTION (needs admin approval)
    if (updateOrderDto.status === 'CANCELLED') {
      if (order.payment?.type === 'CARD' && order.status === 'COMPLETED') {
        // Online payment order → redirect to PENDING_REJECTION instead of direct cancel
        updateData.status = 'PENDING_REJECTION';
        return await this.orderModel.findByIdAndUpdate(
          new Types.ObjectId(id),
          updateData,
          { new: true },
        );
      }

      // Restore stock for cancelled orders. PENDING (never paid) and
      // COMPLETED-COD both hold reserved stock; SHIPPING was already picked &
      // decremented, so cancelling it must return the items to inventory too.
      if (['PENDING', 'COMPLETED', 'SHIPPING'].includes(order.status)) {
        try {
          const restoreItems = order.orderDetail
            .filter((item) => item.variantId && item.quantity > 0)
            .map((item) => ({
              variantId: String(item.variantId),
              quantity: item.quantity,
            }));
          if (restoreItems.length > 0) {
            await firstValueFrom(
              this.productService.send('product.variant.incrementStockBulk', {
                items: restoreItems,
              }),
            );
          }
        } catch (err) {
          console.error('Failed to restore stock on cancel:', err);
        }
      }
    }

    // COD orders: mark payment as checked out when delivered + create payment record
    if (updateOrderDto.status === 'DELIVERED') {
      if (order && order.payment?.type === 'COD') {
        updateData['payment.isCheckout'] = true;
        // Create an actual payment record for COD
        try {
          await firstValueFrom(
            this.paymentService.send('payment.createForCashOnDelivery', {
              orderId: id,
              amount: order.totalAmount,
            }),
          );
        } catch (err) {
          console.error('Failed to create COD payment record:', err);
        }
      }
    }

    // REFUNDED: mark payment as refund
    if (updateOrderDto.status === 'REFUNDED') {
      updateData['payment.isCheckout'] = false;
      try {
        await firstValueFrom(
          this.paymentService.send('payment.refund', { orderId: id }),
        );
      } catch (err) {
        console.error('Failed to refund payment:', err);
      }
    }

    return await this.orderModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      updateData,
      { new: true },
    );
  }

  /**
   * Admin approves rejection → CANCELLED + refund payment
   * Admin rejects the rejection → back to COMPLETED
   */
  async adminHandleRejection(
    id: string,
    action: 'approve' | 'reject',
    refund: boolean = false,
  ) {
    const order = await this.orderModel.findById(new Types.ObjectId(id));
    if (!order || order.status !== 'PENDING_REJECTION') {
      throw new Error('Order not found or not in PENDING_REJECTION status');
    }

    if (action === 'approve') {
      const updateData: any = { status: refund ? 'REFUNDED' : 'CANCELLED' };
      if (refund) {
        updateData['payment.isCheckout'] = false;
        try {
          await firstValueFrom(
            this.paymentService.send('payment.refund', { orderId: id }),
          );
        } catch (err) {
          console.error('Failed to refund payment:', err);
        }
      }

      // Restore stock for all items in the approved cancellation/refund
      try {
        const restoreItems = order.orderDetail
          .filter((item) => item.variantId && item.quantity > 0)
          .map((item) => ({
            variantId: String(item.variantId),
            quantity: item.quantity,
          }));
        if (restoreItems.length > 0) {
          await firstValueFrom(
            this.productService.send('product.variant.incrementStockBulk', {
              items: restoreItems,
            }),
          );
        }
      } catch (err) {
        console.error(
          'Failed to restore stock on rejection approval:',
          err,
        );
      }

      return await this.orderModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        updateData,
        { new: true },
      );
    } else {
      // Reject the rejection → send order back to COMPLETED
      return await this.orderModel.findByIdAndUpdate(
        new Types.ObjectId(id),
        { status: 'COMPLETED', reason: '' },
        { new: true },
      );
    }
  }

  /**
   * Get orders that contain specific variant IDs (for seller order management).
   * Excludes PENDING and EXPIRED orders.
   */
  async getOrdersByVariantIds(
    variantIds: string[],
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
  ) {
    const query: any = {
      $or: [
        { 'orderDetail.variantId': { $in: variantIds } },
        { 'orderDetail.productId': { $in: variantIds } },
      ],
      status: { $nin: ['PENDING', 'EXPIRED'] },
    };

    if (status && status !== 'ALL') {
      query.status = status;
      delete query.$or;
      query['$and'] = [
        {
          $or: [
            { 'orderDetail.variantId': { $in: variantIds } },
            { 'orderDetail.productId': { $in: variantIds } },
          ],
        },
      ];
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions: any[] = [
        { 'customerInfo.fullname': { $regex: s, $options: 'i' } },
        { 'customerInfo.email': { $regex: s, $options: 'i' } },
        { 'customerInfo.phone': { $regex: s, $options: 'i' } },
        { 'orderDetail.productName': { $regex: s, $options: 'i' } },
      ];
      if (/^[0-9a-fA-F]{24}$/.test(s)) {
        searchConditions.push({ _id: new Types.ObjectId(s) });
      }
      if (!query['$and']) query['$and'] = [];
      query['$and'].push({ $or: searchConditions });
    }

    const [items, totalItems] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get orders that contain products by specific product IDs.
   * Used for seller order management (more reliable than variant IDs).
   */
  async getOrdersByProductIds(
    productIds: string[],
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
  ) {
    const query: any = {
      'orderDetail.productId': { $in: productIds },
      status: { $nin: ['PENDING', 'EXPIRED'] },
    };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchConditions: any[] = [
        { 'customerInfo.fullname': { $regex: s, $options: 'i' } },
        { 'customerInfo.email': { $regex: s, $options: 'i' } },
        { 'customerInfo.phone': { $regex: s, $options: 'i' } },
        { 'orderDetail.productName': { $regex: s, $options: 'i' } },
      ];
      if (/^[0-9a-fA-F]{24}$/.test(s)) {
        searchConditions.push({ _id: new Types.ObjectId(s) });
      }
      query.$or = searchConditions;
    }

    const [items, totalItems] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(query),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.orderModel.findByIdAndUpdate(
      new Types.ObjectId(id),
      { payment: updateOrderDto.payment },
      { new: true },
    );
  }

  /**
   * Get dashboard statistics:
   * - totalOrders: total non-expired/pending orders
   * - paidOrders: orders with payment.isCheckout = true
   * - totalIncome: sum of totalAmount from paid orders
   * - platformRevenue: 5% of totalIncome (platform fee)
   */
  async getOrderStats() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      paidStats,
      recentOrders,
      statusCounts,
      monthlyRevenue,
      dailyOrders,
      weeklyRevenue,
    ] = await Promise.all([
      // Total orders (excluding PENDING, EXPIRED)
      this.orderModel.countDocuments({
        status: { $nin: ['PENDING', 'EXPIRED'] },
      }),

      // Paid stats - only count PAID payment status orders
      this.orderModel.aggregate([
        {
          $match: {
            'payment.isCheckout': true,
            status: { $nin: ['CANCELLED', 'REFUNDED', 'EXPIRED'] },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$totalAmount' },
            paidOrders: { $sum: 1 },
          },
        },
      ]),

      // Recent orders
      this.orderModel
        .find({ status: { $nin: ['PENDING', 'EXPIRED'] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Order counts by status
      this.orderModel.aggregate([
        {
          $match: { status: { $nin: ['PENDING', 'EXPIRED'] } },
        },
        {
          $group: { _id: '$status', count: { $sum: 1 } },
        },
      ]),

      // Monthly revenue (this year) - only PAID
      this.orderModel.aggregate([
        {
          $match: {
            'payment.isCheckout': true,
            status: { $nin: ['CANCELLED', 'REFUNDED', 'EXPIRED'] },
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            income: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Daily orders (last 90 days) for area chart
      this.orderModel.aggregate([
        {
          $match: {
            status: { $nin: ['PENDING', 'EXPIRED'] },
            createdAt: { $gte: last90Days },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$payment.isCheckout', true] },
                      {
                        $not: {
                          $in: [
                            '$status',
                            ['CANCELLED', 'REFUNDED', 'EXPIRED'],
                          ],
                        },
                      },
                    ],
                  },
                  '$totalAmount',
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Weekly revenue (last 7 days by day)
      (() => {
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return this.orderModel.aggregate([
          {
            $match: {
              'payment.isCheckout': true,
              status: { $nin: ['CANCELLED', 'REFUNDED', 'EXPIRED'] },
              createdAt: { $gte: last7Days },
            },
          },
          {
            $group: {
              _id: { $dayOfWeek: '$createdAt' },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
      })(),
    ]);

    const stats = paidStats[0] || { totalIncome: 0, paidOrders: 0 };

    // Build status counts map
    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s: { _id: string; count: number }) => {
      statusMap[s._id] = s.count;
    });

    // Build monthly revenue array (12 months)
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyData = monthNames.map((month, idx) => {
      const found = monthlyRevenue.find(
        (m: { _id: number }) => m._id === idx + 1,
      );
      return {
        month,
        income: found ? found.income : 0,
        orders: found ? found.orders : 0,
      };
    });

    // Build weekly revenue array
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const weeklyData = dayNames.map((day, idx) => {
      const found = weeklyRevenue.find(
        (w: { _id: number }) => w._id === idx + 1,
      );
      return {
        day,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.revenue, 0);

    return {
      totalOrders,
      paidOrders: stats.paidOrders,
      totalIncome: stats.totalIncome,
      platformRevenue: Math.round(stats.totalIncome * 0.05),
      recentOrders,
      statusCounts: statusMap,
      monthlyRevenue: monthlyData,
      dailyOrders,
      weeklyRevenue: weeklyData,
      weeklyTotal,
    };
  }

  /**
   * Cron job: expire orders that have passed their expireAt time
   * Runs every 5 minutes
   * Also restores stock for all items in expired orders
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    try {
      const now = new Date();

      // Find all PENDING orders with expired expireAt — only select needed fields
      const expiredOrders = await this.orderModel
        .find({
          status: 'PENDING',
          expireAt: { $ne: null, $lte: now },
        })
        .select('_id orderDetail')
        .lean();

      if (expiredOrders.length === 0) return;

      const orderIds = expiredOrders.map((o) => new Types.ObjectId(o._id));

      // Update all expired orders to EXPIRED status.
      // status:'PENDING' guard prevents clobbering an order that was just paid
      // (webhook COMPLETED) between the find and this write.
      await this.orderModel.updateMany(
        { _id: { $in: orderIds }, status: 'PENDING' },
        { status: 'EXPIRED' },
      );

      // Update all PENDING payments of these orders to EXPIRED (single call)
      try {
        await firstValueFrom(
          this.paymentService.send('payment.expireByOrderIds', {
            orderIds: orderIds.map((id) => id.toString()),
          }),
        );
      } catch (err) {
        console.error('Failed to expire payments for expired orders:', err);
      }

      // Restore stock for all items across expired orders (single bulk call)
      const restoreItems = expiredOrders.flatMap((order) =>
        order.orderDetail
          .filter((item) => item.variantId && item.quantity > 0)
          .map((item) => ({
            variantId: String(item.variantId),
            quantity: item.quantity,
          })),
      );

      if (restoreItems.length > 0) {
        try {
          await firstValueFrom(
            this.productService
              .send('product.variant.incrementStockBulk', {
                items: restoreItems,
              })
              .pipe(
                timeout(15000),
                catchError((err) => {
                  this.logger.error(
                    `Failed to restore stock for expired orders: ${err.message}`,
                  );
                  return of(null);
                }),
              ),
          );
        } catch (err) {
          this.logger.error(
            'Failed to restore stock for expired orders:',
            err,
          );
        }
      }

      console.log(`Expired ${expiredOrders.length} orders and restored stock`);
    } catch (error) {
      console.error('Error in handleExpiredOrders cron:', error);
    }
  }
}
