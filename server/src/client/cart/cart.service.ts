import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpdateCartDto } from 'src/client/cart/dto/update-cart.dto';
import { Cart } from 'src/client/cart/entities/cart.entity';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) { }

  async findOne(id: mongoose.Types.ObjectId) {
    return await this.cartModel.findOne({ guestId: id }).populate('cartItems.product');
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Nếu id không hợp lệ, tạo mới giỏ hàng
      const cartItems = updateCartDto.cartItems?.map(item => {
        return {
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }
      })

      const dataCartCreate = {
        guestId: updateCartDto.guestId,
        cartItems: cartItems,
        total: updateCartDto.total
      }
      const cart = await this.cartModel.create(dataCartCreate);
      return cart.save();
    } else {
      const cartItems = updateCartDto.cartItems?.map(item => {
        return {
          product: item.product?._id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }
      })

      const dataCartUpdate = {
        guestId: updateCartDto.guestId,
        cartItems: cartItems,
        total: updateCartDto.total
      }
      return await this.cartModel.findByIdAndUpdate(id, dataCartUpdate);
    }
  }
}
