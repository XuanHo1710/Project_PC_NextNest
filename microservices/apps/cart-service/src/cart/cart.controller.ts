import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('cart.findOne')
  findOne(@Payload() data: { guestId: string }) {
    return this.cartService.findOne(data.guestId);
  }

  @MessagePattern('cart.update')
  update(@Payload() data: { id: string; updateCartDto: UpdateCartDto }) {
    return this.cartService.update(data.id, data.updateCartDto);
  }
}
