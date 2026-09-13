// services/brand.service.ts
import type { IBrand } from "@/types/brand";
import axiosInstance from "@/config/axios";
import { PaginatedResponse } from "@/types/common";
import { asEnvelope } from "./base.service";

class BrandService {
  protected baseUrl: string = "brand";

  async getAll(queryParams: string = ""): Promise<PaginatedResponse<IBrand>> {
    const response = asEnvelope<PaginatedResponse<IBrand>>(
      await axiosInstance.get(`${this.baseUrl}${queryParams}`),
    );
    return response.data as PaginatedResponse<IBrand>;
  }

  async getById(id: string): Promise<IBrand> {
    const response = asEnvelope<IBrand>(
      await axiosInstance.get(`${this.baseUrl}/${id}`),
    );
    return response.data as IBrand;
  }

  async create(
    data: Omit<IBrand, "_id">,
  ): Promise<{ data: IBrand; status: number }> {
    const response = asEnvelope<IBrand>(await axiosInstance.post(this.baseUrl, data));
    return { data: response.data as IBrand, status: response.statusCode };
  }

  async update(
    id: string,
    data: Partial<IBrand>,
  ): Promise<{ data: IBrand; status: number }> {
    const response = asEnvelope<IBrand>(
      await axiosInstance.patch(`${this.baseUrl}/${id}`, data),
    );
    return { data: response.data as IBrand, status: response.statusCode };
  }

  async delete(id: string): Promise<{ status: number }> {
    const response = asEnvelope<IBrand>(
      await axiosInstance.delete(`${this.baseUrl}/${id}`),
    );
    return { status: response.statusCode };
  }

  async updateMany(
    ids: string[],
    typeUpdate: string,
  ): Promise<{ status: number }> {
    const response = asEnvelope<IBrand>(
      await axiosInstance.patch(`${this.baseUrl}/updateMany`, {
        ids,
        typeUpdate,
      }),
    );
    return { status: response.statusCode };
  }

  async search(queryParams: string = ""): Promise<IBrand[]> {
    const response = asEnvelope<IBrand[]>(
      await axiosInstance.get(`${this.baseUrl}/search${queryParams}`),
    );
    return response.data ?? [];
  }
}

export const brandService = new BrandService();
