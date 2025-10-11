import axiosClient from '@/config/axiosClient';
import { IOrderData } from '@/types/model.client';


class OrderClientService {
    async createOrder(data: IOrderData): Promise<IOrderData> {
        const response = await axiosClient.post('/order', data);
        return response.data;
    }

}

export const orderClientService = new OrderClientService();