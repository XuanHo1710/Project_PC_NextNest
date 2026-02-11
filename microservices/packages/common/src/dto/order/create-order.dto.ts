import { Types } from 'mongoose';

export class CreateOrderDto {
  customerInfo: {
    guestId: Types.ObjectId;
    fullname: string;
    address: string;
    email: string;
    phone: string;
    note: string;
  };

  orderDetail: [
    {
      product: {
        _id: Types.ObjectId;
      };
      quantity: number;
      subtotal: number;
      price: number;
    },
  ];

  totalAmount: number;
}
