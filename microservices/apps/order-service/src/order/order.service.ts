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
      const dataCreate = {
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

      const order = await this.orderModel.create(dataCreate);

      if (createOrderDto.payment.type === 'CARD') {
        // Online payment: create PayOS payment link
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
        // COD payment: create payment record and process immediately
        const codPayment = await firstValueFrom(
          this.paymentService.send('payment.createForCashOnDelivery', {
            orderId: order._id.toString(),
            amount: order.totalAmount,
            guestId: createOrderDto.customerInfo.guestId,
          }),
        );

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
}
