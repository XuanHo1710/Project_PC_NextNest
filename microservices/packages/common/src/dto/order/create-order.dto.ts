import { IsNotEmpty } from "class-validator";
export class CreateOrderDto {
  @IsNotEmpty({ message: "Thông tin khách hàng không được để trống" })
  customerInfo: {
    guestId: string;
    fullname: string;
    address: string;
    email: string;
    phone: string;
    note: string;
  };

  @IsNotEmpty({ message: "Đơn hàng không được để trống" })
  orderDetail: [
    {
      product?: {
        name?: string;
        slug?: string;
      };
      productVariant: {
        _id: string;
        combination?: Record<string, string>;
      };
      quantity: number;
      subtotal: number;
      price: number;
    },
  ];

  @IsNotEmpty({ message: "Phương thức thanh toán không được để trống" })
  payment: {
    isCheckout: boolean;
    type: string;
  };
}
