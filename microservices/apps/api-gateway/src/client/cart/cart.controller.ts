import { Controller, Get, Body, Patch, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE, UpdateCartDto } from '@project-pc/common';

@Controller('/client/cart')
export class CartController {
  constructor(
    @Inject(MICROSERVICE.CART_SERVICE)
    private readonly cartService: ClientProxy,
  ) {}

  @Get(':id')
  findOne(@Param('id') guestId: string) {
    return this.cartService.send('cart.findOne', { guestId });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.send('cart.update', { id, updateCartDto });
  }
}
