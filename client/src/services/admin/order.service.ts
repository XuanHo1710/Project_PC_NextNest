import axiosInstance from "@/config/axios";
import type { IOrder } from "@/types/order";
import type { PaginatedResponse } from "@/types";

class OrderService {
  private baseUrl = "order";

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentType?: string;
    search?: string;
  }): Promise<PaginatedResponse<IOrder>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.paymentType) query.set("paymentType", params.paymentType);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    const response = await axiosInstance.get(
      `${this.baseUrl}${qs ? `?${qs}` : ""}`,
    );
    return response.data;
  }

  async getById(id: string): Promise<IOrder> {
    const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateStatus(
    id: string,
    status: string,
  ): Promise<{ data: IOrder; status: number }> {
    const response = await axiosInstance.patch(`${this.baseUrl}/${id}/status`, {
      status,
    });
    return { data: response.data, status: response.status };
  }

  async updatePayment(
    id: string,
    payment: { isCheckout: boolean; type: string },
  ): Promise<{ data: IOrder; status: number }> {
    const response = await axiosInstance.patch(
      `${this.baseUrl}/${id}/payment`,
      { payment },
    );
    return { data: response.data, status: response.status };
  }

  async confirmCodPayment(
    id: string,
    amount: number,
  ): Promise<{ data: any; status: number }> {
    const response = await axiosInstance.patch(
      `${this.baseUrl}/${id}/confirm-cod`,
      { amount },
    );
    return { data: response.data, status: response.status };
  }

  async getStats(): Promise<{
    totalOrders: number;
    paidOrders: number;
    totalIncome: number;
    platformRevenue: number;
    recentOrders: any[];
    statusCounts: Record<string, number>;
    monthlyRevenue: { month: string; income: number; orders: number }[];
    dailyOrders: { _id: string; orders: number; revenue: number }[];
    weeklyRevenue: { day: string; revenue: number; orders: number }[];
    weeklyTotal: number;
  }> {
    const response = await axiosInstance.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  async handleRejection(
    id: string,
    action: "approve" | "reject",
    refund?: boolean,
  ): Promise<{ data: IOrder; status: number }> {
    const response = await axiosInstance.patch(
      `${this.baseUrl}/${id}/handle-rejection`,
      { action, refund },
    );
    return { data: response.data, status: response.status };
  }
}

export const orderService = new OrderService();
