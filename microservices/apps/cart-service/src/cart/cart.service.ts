import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateCartDto } from '@project-pc/common';
import { Cart } from 'src/cart/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  async findOne(id: string) {
    const cart = await this.cartModel
      .findOne({ guestId: new Types.ObjectId(id) })
      .populate('cartItems.product');

    return cart;
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    let result;

    if (!id || id === null) {
      // Nếu id không hợp lệ, tạo mới giỏ hàng
      const cartItems = updateCartDto.cartItems?.map((item) => {
        return {
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        };
      });

      const dataCartCreate = {
        guestId: updateCartDto.guestId,
        cartItems: cartItems,
        total: updateCartDto.total,
      };
      const cart = new this.cartModel(dataCartCreate);
      result = await cart.save();
    } else {
      const cartItems = updateCartDto.cartItems?.map((item) => {
        return {
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        };
      });

      const dataCartUpdate = {
        guestId: updateCartDto.guestId,
        cartItems: cartItems,
        total: updateCartDto.total,
      };
      result = await this.cartModel.findByIdAndUpdate(id, dataCartUpdate);
    }

    return result;
  }
}
