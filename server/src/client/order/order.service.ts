import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';
import { Cart } from 'src/client/cart/entities/cart.entity';
import { CreateOrderDto } from 'src/client/order/dto/create-order.dto';
import { UpdateOrderDto } from 'src/client/order/dto/update-order.dto';
import { Order } from 'src/client/order/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto) {
    const dataCreate = {
      guestId: createOrderDto.guestId,
      customerInfo: {
        fullname: createOrderDto.customerInfo.fullname,
        address: createOrderDto.customerInfo.address,
        email: createOrderDto.customerInfo.email,
        phone: createOrderDto.customerInfo.phone,
        note: createOrderDto.customerInfo.note,
      },
      orderDetail: createOrderDto.orderDetail.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        price: item.price,
      })),
      totalAmount: createOrderDto.totalAmount
    }

    await Promise.all(createOrderDto.orderDetail.map(async (item) => {
      // Cập nhật số lượng đã bán và tồn kho của sản phẩm
      await this.productModel.findByIdAndUpdate(item.product._id, { $inc: { soldCount: item.quantity, stock: -item.quantity } });
    }));

    // Xóa giỏ hàng sau khi tạo đơn hàng
    await this.cartModel.findOneAndDelete({ guestId: createOrderDto.guestId });

    return await this.orderModel.create(dataCreate);
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {

  }

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {

  }
}
