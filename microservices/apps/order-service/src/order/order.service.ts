import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateOrderDto,
  MICROSERVICE,
  UpdateOrderDto,
} from '@project-pc/common';
import { Order } from 'src/order/entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
    @Inject(MICROSERVICE.NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
    @Inject(MICROSERVICE.PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, ip: string) {
    try {
      const isOnlinePayment = createOrderDto.payment.type === 'CARD';

      const dataCreate: any = {
        customerInfo: {
          guestId: new Types.ObjectId(createOrderDto.customerInfo.guestId),
          fullname: createOrderDto.customerInfo.fullname,
          address: createOrderDto.customerInfo.address,
          email: createOrderDto.customerInfo.email,
          phone: createOrderDto.customerInfo.phone,
          note: createOrderDto.customerInfo.note,
        },
        orderDetail: createOrderDto.orderDetail.map((item: any) => ({
          // Snapshot variant info (lưu trực tiếp)
          variantId: item.productVariant._id || '',
          productId: item.product?._id || '',
          sku: item.productVariant?.sku || '',
          variantPrice: item.productVariant?.price || 0,
          discount: item.productVariant?.discount || 0,
          images: item.productVariant?.images || [],
          combination: item.productVariant?.combination || {},
          // Product info
          productName: item.product?.name || '',
          // Order item info
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        totalAmount: createOrderDto.orderDetail.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        ),
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

        // Update stock for COD orders immediately
        for (const item of createOrderDto.orderDetail) {
          try {
            await firstValueFrom(
              this.productService.send('product.variant.decrementStock', {
                variantId: item.productVariant._id,
                quantity: item.quantity,
              }),
            );
          } catch (err) {
            console.error(
              'Stock update error for variant:',
              item.productVariant._id,
              err,
            );
          }
        }

        // Send COD order confirmation email (fire and forget)
        this.notificationService.emit('notification.sendOrderConfirmation', {
          email: createOrderDto.customerInfo.email,
          orderId: order._id.toString(),
          amount: order.totalAmount,
          orderItems: createOrderDto.orderDetail.map((item: any) => ({
            productVariant: item.productVariant._id,
            productName: item.product?.name || '',
            combination: item.productVariant?.combination || {},
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

    const dataCreate: any = {
      customerInfo: {
        guestId: new Types.ObjectId(createOrderDto.customerInfo.guestId),
        fullname: createOrderDto.customerInfo.fullname,
        address: createOrderDto.customerInfo.address,
        email: createOrderDto.customerInfo.email,
        phone: createOrderDto.customerInfo.phone,
        note: createOrderDto.customerInfo.note,
      },
      orderDetail: createOrderDto.orderDetail.map((item: any) => ({
        variantId: item.productVariant._id || '',
        productId: item.product?._id || '',
        sku: item.productVariant?.sku || '',
        variantPrice: item.productVariant?.price || 0,
        discount: item.productVariant?.discount || 0,
        images: item.productVariant?.images || [],
        combination: item.productVariant?.combination || {},
        productName: item.product?.name || '',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      totalAmount: createOrderDto.orderDetail.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      ),
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
      .sort({ createdAt: -1 });
    return orders;
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    return order;
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
      .limit(limit);

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

    const totalItems = await this.orderModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const items = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {
    const updateData: any = { status: updateOrderDto.status };
    if (updateOrderDto.reason !== undefined) {
      updateData.reason = updateOrderDto.reason;
    }

    // COD orders: mark payment as checked out when delivered + create payment record
    if (updateOrderDto.status === 'DELIVERED') {
      const order = await this.orderModel.findById(new Types.ObjectId(id));
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

    const totalItems = await this.orderModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const items = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

    const totalItems = await this.orderModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const items = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    try {
      const now = new Date();

      // Find all PENDING orders with expired expireAt
      const expiredOrders = await this.orderModel.find({
        status: 'PENDING',
        expireAt: { $ne: null, $lte: now },
      });

      if (expiredOrders.length === 0) return;

      const orderIds = expiredOrders.map((o) => new Types.ObjectId(o._id));

      // Update all expired orders to EXPIRED status
      await this.orderModel.updateMany(
        { _id: { $in: orderIds } },
        { status: 'EXPIRED' },
      );

      // Update all PENDING payments of these orders to EXPIRED
      for (const orderId of orderIds) {
        try {
          await firstValueFrom(
            this.paymentService.send('payment.expireByOrderId', {
              orderId: orderId.toString(),
            }),
          );
        } catch (err) {
          console.error(
            'Failed to expire payments for order:',
            orderId.toString(),
            err,
          );
        }
      }

      console.log(`Expired ${expiredOrders.length} orders`);
    } catch (error) {
      console.error('Error in handleExpiredOrders cron:', error);
    }
  }
}
