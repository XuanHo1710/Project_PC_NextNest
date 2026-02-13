import axiosClient from "@/config/axiosClient";
import { PaginatedResponse } from "@/types";
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

  async getOrdersByGuestId(
    guestId: string,
    params?: { page?: number; limit?: number; status?: string },
  ): Promise<PaginatedResponse<IOrder>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.status && params.status !== "ALL")
      query.set("status", params.status);
    const qs = query.toString();
    const response = await axiosClient.get(
      `/order/guest/${guestId}${qs ? `?${qs}` : ""}`,
    );
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
