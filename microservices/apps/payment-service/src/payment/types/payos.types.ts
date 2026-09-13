export interface PayOSClientConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

export interface PayOSCreatePaymentLinkBody {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl?: string;
  cancelUrl?: string;
  expiredAt?: number;
}

export interface PayOSRequestOptions {
  maxRetries?: number;
  timeout?: number;
}

export interface PayOSTransaction {
  reference: string;
  transactionDateTime: string;
}

export interface PayOSPaymentLink {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid?: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'PROCESSING';
  checkoutUrl: string;
  paymentLinkId: string;
  transactions: PayOSTransaction[];
}

export interface PayOSConstructorStatic {
  new (config: PayOSClientConfig): PayOSClient;
}

export interface PayOSClient {
  paymentRequests: {
    create(
      body: PayOSCreatePaymentLinkBody,
      options?: PayOSRequestOptions,
    ): Promise<PayOSPaymentLink>;
    get(id: number | string): Promise<PayOSPaymentLink>;
    cancel(
      id: number | string,
      cancellationReason?: string,
    ): Promise<PayOSPaymentLink>;
  };
}
