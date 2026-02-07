import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from '@project-pc/common';

@Controller('/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':id')
  findOne(@Param('id') guestId: string) {
    return this.cartService.findOne(guestId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(id, updateCartDto);
  }
}
