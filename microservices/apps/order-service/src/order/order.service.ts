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
          productVariant: new Types.ObjectId(item.productVariant._id),
          productName: item.product?.name || '',
          combination: item.productVariant?.combination || {},
          quantity: item.quantity,
          subtotal: item.subtotal,
          price: item.price,
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
      .populate('orderDetail.productVariant')
      .sort({ createdAt: -1 });
    return orders;
  }

  async getOrderById(orderId: string) {
    const order = await this.orderModel
      .findById(orderId)
      .populate('orderDetail.productVariant');
    return order;
  }

  async getAllOrdersByGuestId(guestId: string) {
    const orders = await this.orderModel
      .find({ 'customerInfo.guestId': new Types.ObjectId(guestId) })
      .populate('orderDetail.productVariant')
      .sort({ createdAt: -1 });

    return orders;
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.orderModel.findByIdAndUpdate(
      id,
      { status: updateOrderDto.status },
      { new: true },
    );
  }

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.orderModel.findByIdAndUpdate(
      id,
      { payment: updateOrderDto.payment },
      { new: true },
    );
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

      const orderIds = expiredOrders.map((o) => o._id);

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
