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

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(MICROSERVICE.PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, ip: string) {
    // Luồng đặt hàng
    // 1. Tạo đơn hàng mới với trạng thái "pending"
    // 2.1 Tạo payment nếu khách hàng chọn thanh toán online => thành công => cập nhật payment thành PAID. Nếu fail thì quay lại bước 1
    //  payment: {
    //   isCheckout: true;
    //   type: 'CARD';
    // };
    // 2.2 Tạo payment nếu khách hàng chọn thanh toán khi nhận hàng => cập nhật payment thành UNPAID. Nếu fail thì quay lại bước 1
    //  payment: {
    //   isCheckout: false;
    //   type: 'CASH';
    // };
    // 3. Gửi thông báo qua email cho khách hàng (Notification Service). Nếu fail thì quay lại bước 2
    // 4. Cập nhật số lượng tồn kho. Nếu fail thì quay lại bước 3
    // 5. Cập nhật trạng thái đơn hàng thành "SHIPPING". Nếu fail thì quay lại bước 4
    //
    //
    // 6. Cập nhật trạng thái đơn hàng thành "DELIVERED" khi khách hàng nhận được hàng
    // và cập nhật payment thành PAID nếu khách hàng thanh toán khi nhận hàng
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
        orderDetail: createOrderDto.orderDetail.map((item) => ({
          productVariant: new Types.ObjectId(item.productVariant._id),
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

      // Nếu khách hàng chọn thanh toán online thì tạo payment
      if (createOrderDto.payment.type === 'CARD') {
        // Đã tạo đơn hàng thành công, tiếp tục tạo payment
        const createPaymentDto = {
          order: order._id.toString(),
          amount: order.totalAmount,
        };
        this.paymentService.emit('payment.create', {
          createPaymentDto: createPaymentDto,
          ip: ip,
        });
      } else {
        // Khách hàng chọn thanh toán khi nhận hàng (COD)
        const createPaymentDto = {
          order: order._id.toString(),
          amount: order.totalAmount,
        };
        this.paymentService.emit('payment.createForCashOnDelivery', {
          createPaymentDto: createPaymentDto,
        });
      }

      return order;
    } catch (error) {
      // Xử lý lỗi tại đây (gửi cái message lỗi cho bên service khác biết)
      console.error('Error creating order:', error);
    }
  }

  async getAllOrdersByGuestId(guestId: string) {
    const orders = await this.orderModel
      .find({ guestId: guestId })
      .populate('orderDetail.productVariant')
      .sort({ createdAt: -1 });

    return orders;
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {}

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {}
}
