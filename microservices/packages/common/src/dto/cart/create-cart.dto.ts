import { IsNumber } from 'class-validator';

export class CreateCartDto {
  guestId: string;
  cartItems: [
    {
      product: { _id: string };
      quantity: number;
      subtotal: number;
      price: number;
    },
  ];
  @IsNumber({}, { message: 'Tổng tiền phải là số nguyên' })
  total: number;
}
