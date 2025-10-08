import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import mongoose from 'mongoose';
import { UpdateCartDto } from 'src/client/cart/dto/update-cart.dto';

@Controller('/cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get(':id')
  findOne(@Param('id') guestId: mongoose.Types.ObjectId) {
    return this.cartService.findOne(guestId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateCartDto: UpdateCartDto) {
    return this.cartService.update(id, UpdateCartDto);
  }
}
