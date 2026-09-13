import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICE, UpdateCartDto } from '@project-pc/common';
import { Guest } from 'decorators/customize';

@Controller('/client/cart')
export class CartController {
  constructor(
    @Inject(MICROSERVICE.CART_SERVICE)
    private readonly cartService: ClientProxy,
  ) {}

  /**
   * The cart id in the path is ignored for authorization purposes —
   * ownership is always derived from the JWT identity.
   */
  @Get(':id')
  findOne(@Guest() guest: any, @Param('id') _guestId: string) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    return this.cartService.send('cart.findOne', {
      guestId: guest._id,
      requesterId: guest._id,
    });
  }

  @Patch(':id')
  update(
    @Guest() guest: any,
    @Param('id') _id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    if (!guest?._id) throw new ForbiddenException('Bạn chưa đăng nhập');
    return this.cartService.send('cart.update', {
      id: guest._id,
      updateCartDto,
      requesterId: guest._id,
    });
  }
}
