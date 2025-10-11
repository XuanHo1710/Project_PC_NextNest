import axiosClient from '@/config/axiosClient';
import { IOrderData } from '@/types/model.client';

export interface CreatePaymentRequest extends IOrderData {
    orderId: string;
    orderDescription: string;
}

interface PaymentResponse {
    vnpayResponse: string;
}

interface VerifyResponse {
    isValid: boolean;
    transactionData: Record<string, string>;
    message: string;
}


class PaymentClientService {
    async createVnpayPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
        const response = await axiosClient.post('/payment/create-vnpay-url', data);
        return response.data;
    }

    async verifyVnpayReturn(queryParams: URLSearchParams): Promise<VerifyResponse> {
        const response = await axiosClient.get(`/payment/vnpay-return?${queryParams.toString()}`);
        return response.data;
    }
}

export const paymentClientService = new PaymentClientService();