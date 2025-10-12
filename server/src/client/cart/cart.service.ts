import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UpdateCartDto } from 'src/client/cart/dto/update-cart.dto';
import { Cart } from 'src/client/cart/entities/cart.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async findOne(id: mongoose.Types.ObjectId) {
    const cacheKey = `guest:cart:${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const cart = await this.cartModel.findOne({ guestId: id }).populate('cartItems.product');

    // Cache for 5 minutes (cart changes frequently)
    if (cart) {
      await this.cacheManager.set(cacheKey, cart, 300000);
    }

    return cart;
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    let result;

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
      result = await cart.save();
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
      result = await this.cartModel.findByIdAndUpdate(id, dataCartUpdate);
    }

    // Invalidate guest cart cache
    const cacheKey = `guest:cart:${updateCartDto.guestId}`;
    await this.cacheManager.del(cacheKey);
    return result;
  }
}
