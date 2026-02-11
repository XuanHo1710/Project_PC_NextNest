import { IsNotEmpty, IsNumber } from "class-validator";
export class CreatePaymentDto {
  @IsNotEmpty({ message: "Khách hàng không được để trống" })
  guest: string;

  @IsNotEmpty({ message: "Đơn hàng không được để trống" })
  order: string;

  @IsNumber({}, { message: "Số tiền phải là một số" })
  @IsNotEmpty({ message: "Số tiền không được để trống" })
  amount: number;

  status: string;

  transactionId: string; // Mã giao dịch từ cổng thanh toán;
}
