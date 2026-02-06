import axiosClient from "@/config/axiosClient";
import { IOrderData } from "@/types/order";

class OrderClientService {
  async createOrder(data: IOrderData): Promise<IOrderData> {
    const response = await axiosClient.post("/order", data);
    return response.data;
  }

  async getOrdersByGuestId(guestId: string): Promise<IOrderData[]> {
    const response = await axiosClient.get(`/order/guest/${guestId}`);
    return response.data;
  }
}

export const orderClientService = new OrderClientService();
