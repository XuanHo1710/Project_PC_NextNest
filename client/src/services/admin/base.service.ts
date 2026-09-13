// services/base.service.ts
import axiosInstance from "@/config/axios";
import { PaginatedResponse } from "@/types/common";
import { AxiosRequestConfig } from "axios";

// The axios response interceptor unwraps AxiosResponse once, so every call
// resolves to the backend envelope instead of a raw AxiosResponse.
export interface APIEnvelope<T> {
  statusCode: number;
  message: string;
  data: T | null;
  error: string | null;
  timestamp: string;
}

export const asEnvelope = <T>(response: unknown): APIEnvelope<T> =>
  response as APIEnvelope<T>;

export class BaseService<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(queryParams = ""): Promise<PaginatedResponse<T>> {
    const response = asEnvelope<PaginatedResponse<T>>(
      await axiosInstance.get(`${this.baseUrl}${queryParams}`),
    );
    return response.data as PaginatedResponse<T>;
  }

  async getById(id: string, config?: AxiosRequestConfig): Promise<T> {
    const response = asEnvelope<T>(
      await axiosInstance.get(`${this.baseUrl}/${id}`, config),
    );
    return response.data as T;
  }

  async create(data: Omit<T, "_id">): Promise<{ data: T; status: number }> {
    const response = asEnvelope<T>(await axiosInstance.post(this.baseUrl, data));
    return { data: response.data as T, status: response.statusCode };
  }

  async update(
    id: string,
    data: Partial<T>,
  ): Promise<{ data: T; status: number }> {
    const response = asEnvelope<T>(
      await axiosInstance.patch(`${this.baseUrl}/${id}`, data),
    );
    return { data: response.data as T, status: response.statusCode };
  }

  async delete(id: string): Promise<{ status: number }> {
    const response = asEnvelope<T>(
      await axiosInstance.delete(`${this.baseUrl}/${id}`),
    );
    return { status: response.statusCode };
  }

  async updateMany(
    ids: string[],
    typeUpdate: string,
  ): Promise<{ status: number }> {
    const response = asEnvelope<T>(
      await axiosInstance.patch(`${this.baseUrl}/updateMany`, {
        ids,
        typeUpdate,
      }),
    );
    return { status: response.statusCode };
  }
}
