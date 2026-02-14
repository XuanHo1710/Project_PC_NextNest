import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('cart.findOne')
  async findOne(@Payload() data: { guestId: string }) {
    return await this.cartService.findOne(data.guestId);
  }

  @MessagePattern('cart.update')
  async update(@Payload() data: { id: string; updateCartDto: UpdateCartDto }) {
    return await this.cartService.update(data.id, data.updateCartDto);
  }
}
