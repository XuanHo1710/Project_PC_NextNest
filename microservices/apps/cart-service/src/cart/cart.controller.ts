import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from '@project-pc/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern('cart.findOne')
  async findOne(@Payload() data: { guestId: string; requesterId?: string }) {
    return await this.cartService.findOne(data.guestId, data.requesterId);
  }

  @MessagePattern('cart.update')
  async update(
    @Payload() data: {
      id: string;
      updateCartDto: UpdateCartDto;
      requesterId?: string;
    },
  ) {
    return await this.cartService.update(
      data.id,
      data.updateCartDto,
      data.requesterId,
    );
  }
}
