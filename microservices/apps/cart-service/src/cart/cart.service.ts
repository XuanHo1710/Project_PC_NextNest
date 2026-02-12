import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateCartDto } from '@project-pc/common';
import { Cart } from 'src/cart/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  /**
   * Tìm cart theo guestId, populate đầy đủ thông tin variant → product → brand/category
   * The populate chain:
   * - cartItems.product: references ProductVariant by its _id
   * - ProductVariant.product: references Product by its _id
   * - Product.brand & Product.category: references Brand and Category
   */
  async findOne(guestId: string) {
    const cart = await this.cartModel
      .findOne({ guestId: new Types.ObjectId(guestId) })
      .populate({
        path: 'cartItems.product',
        populate: {
          path: 'product',
          select: '_id name slug brand category',
          populate: [
            { path: 'brand', select: '_id name logo' },
            { path: 'category', select: '_id name slug' },
          ],
        },
      });

    return cart;
  }

  /**
   * Upsert cart theo guestId — luôn chỉ tạo 1 cart duy nhất cho mỗi guest.
   * Nếu chưa có → tạo mới, nếu đã có → cập nhật.
   */
  async update(guestIdParam: string, updateCartDto: UpdateCartDto) {
    // Use guestId from URL param as authoritative source
    const guestId = new Types.ObjectId(guestIdParam);

    const cartItems = (updateCartDto.cartItems || []).map((item) => ({
      product: new Types.ObjectId(item.product?._id),
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    const result = await this.cartModel.findOneAndUpdate(
      { guestId },
      { $set: { guestId, cartItems, total: updateCartDto.total } },
      { upsert: true, new: true },
    );

    return result;
  }
}
