import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto, UpdateOrderDto } from '@project-pc/common';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const dataCreate = {
      customerInfo: {
        guestId: createOrderDto.customerInfo.guestId,
        fullname: createOrderDto.customerInfo.fullname,
        address: createOrderDto.customerInfo.address,
        email: createOrderDto.customerInfo.email,
        phone: createOrderDto.customerInfo.phone,
        note: createOrderDto.customerInfo.note,
      },
      orderDetail: createOrderDto.orderDetail.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        subtotal: item.subtotal,
        price: item.price,
      })),
      totalAmount: createOrderDto.totalAmount,
    };

    // await Promise.all(createOrderDto.orderDetail.map(async (item) => {
    //   // Get full product details for cache invalidation
    //   const product = await this.productModel.findById(item.product._id).select('slug category').exec();

    //   // Cập nhật số lượng đã bán và tồn kho của sản phẩm
    //   await this.productModel.findByIdAndUpdate(item.product._id, { $inc: { soldCount: item.quantity, stock: -item.quantity } });

    //   if (product) {
    //     // Invalidate product cache
    //     const productCacheKey = `product:slug:${product.slug}`;
    //     await this.cacheManager.del(productCacheKey);

    //     // Invalidate product category cache
    //     if (product.category) {
    //       for (let page = 1; page <= 10; page++) {
    //         await this.cacheManager.del(`products:category:${product.category}:page:${page}:sort::cpu::ram::price:`);
    //       }
    //     }
    //   }
    // }));

    const order = await this.orderModel.create(dataCreate);

    return order;
  }

  async getAllOrdersByGuestId(guestId: string) {
    const orders = await this.orderModel
      .find({ guestId: guestId })
      .populate('orderDetail.product')
      .sort({ createdAt: -1 });

    return orders;
  }

  async updateOrderStatus(id: string, updateOrderDto: UpdateOrderDto) {}

  async updateOrderPayment(id: string, updateOrderDto: UpdateOrderDto) {}
}
