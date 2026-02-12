import axiosClient from "@/config/axiosClient";
import { IOrder, IOrderData } from "@/types/order";

export interface CreateOrderResponse {
  orderId: string;
  url?: string;
  orderCode?: number;
  paymentType: string;
  totalAmount?: number;
  customerInfo?: {
    guestId: string;
    fullname: string;
    address: string;
    email: string;
    phone: string;
    note: string;
  };
}

class OrderClientService {
  async createOrder(data: IOrderData): Promise<CreateOrderResponse> {
    const response = await axiosClient.post("/order", data);
    return response.data;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const response = await axiosClient.get(`/order/${orderId}`);
    return response.data;
  }

  async getOrdersByGuestId(guestId: string): Promise<IOrder[]> {
    const response = await axiosClient.get(`/order/guest/${guestId}`);
    return response.data;
  }

  async getPendingOnlineOrders(guestId: string): Promise<IOrder[]> {
    const response = await axiosClient.get(`/order/pending-online/${guestId}`);
    return response.data;
  }

  async retryPayment(orderId: string): Promise<CreateOrderResponse> {
    const response = await axiosClient.post(`/order/${orderId}/retry-payment`);
    return response.data;
  }
}

export const orderClientService = new OrderClientService();
