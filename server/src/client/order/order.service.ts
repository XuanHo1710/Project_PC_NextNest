import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/admin/product/entities/product.entity';
import { Cart } from 'src/client/cart/entities/cart.entity';
import { CreateOrderDto } from 'src/client/order/dto/create-order.dto';
import { UpdateOrderDto } from 'src/client/order/dto/update-order.dto';
import { Order } from 'src/client/order/entities/order.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
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

    const order = await this.orderModel.create(dataCreate);

    // Invalidate guest orders cache
    const cacheKey = `guest:orders:${createOrderDto.guestId}`;
    await this.cacheManager.del(cacheKey);
    return order;
  }

  async getAllOrdersByGuestId(guestId: string) {
    // Generate cache key
    const cacheKey = `guest:orders:${guestId}`;

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }


    const orders = await this.orderModel.find({ guestId: guestId }).populate('orderDetail.product').sort({ createdAt: -1 });

    // Cache for 10 minutes (orders change frequently)
    await this.cacheManager.set(cacheKey, orders, 600000);

    return orders;
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {

  }

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {

  }
}
