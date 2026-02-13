export class UpdateOrderDto {
  status?: string;

  payment?: {
    isCheckout: boolean;
    type: string;
  };

  reason?: string;
}
