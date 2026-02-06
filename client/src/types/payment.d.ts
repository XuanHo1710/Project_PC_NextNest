// ============== PAYMENT TRANSACTION ==============
// Based on: auth-service/account-guest/entities/payment-transaction.entity.ts

export interface IPaymentTransaction {
  _id: string;
  transactionId: string;
  orderId: string;
  guestId: string;
  amount: number;
  paymentMethod: "VNPAY" | "MOMO" | "COD";
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
  vnpayInfo?: {
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TransactionStatus: string;
    vnp_SecureHash: string;
  };
  momoInfo?: {
    partnerCode: string;
    requestId: string;
    orderId: string;
    transId: string;
    resultCode: number;
    message: string;
    responseTime: string;
    extraData: string;
    signature: string;
  };
  processedAt?: string;
  failureReason?: string;
  refundInfo?: {
    refundId: string;
    refundAmount: number;
    refundDate: string;
    refundReason: string;
    refundStatus: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
