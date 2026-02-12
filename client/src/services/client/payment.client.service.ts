import axiosClient from "@/config/axiosClient";

export interface VerifyPaymentRequest {
  orderCode: number;
  status: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    paymentCode: number;
    amount: number;
    status: string;
    transactionId?: string;
    paidAt?: string;
    orderId?: string;
  };
}

class PaymentClientService {
  async verifyPayment(
    payload: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResponse> {
    const response = await axiosClient.post("/payment/verify", payload);
    return response.data;
  }
}

export const paymentClientService = new PaymentClientService();
