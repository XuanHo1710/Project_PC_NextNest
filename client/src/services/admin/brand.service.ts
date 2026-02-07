// services/brand.service.ts
import type { IBrand } from "@/types/brand";
import axiosInstance from "@/config/axios";

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class BrandService {
    protected baseUrl: string = "brand";

    async getAll(queryParams: string = ""): Promise<PaginatedResponse<IBrand>> {
        const response = await axiosInstance.get(`${this.baseUrl}${queryParams}`);
        return response.data;
    }

    async getById(id: string): Promise<IBrand> {
        const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Omit<IBrand, "_id">): Promise<{ data: IBrand; status: number }> {
        const response = await axiosInstance.post(this.baseUrl, data);
        return { data: response.data, status: response.status };
    }

    async update(id: string, data: Partial<IBrand>): Promise<{ data: IBrand; status: number }> {
        const response = await axiosInstance.patch(`${this.baseUrl}/${id}`, data);
        return { data: response.data, status: response.status };
    }

    async delete(id: string): Promise<{ status: number }> {
        const response = await axiosInstance.delete(`${this.baseUrl}/${id}`);
        return { status: response.status };
    }

    async updateMany(ids: string[], typeUpdate: string): Promise<{ status: number }> {
        const response = await axiosInstance.patch(`${this.baseUrl}/updateMany`, {
            ids,
            typeUpdate,
        });
        return { status: response.status };
    }

    async search(queryParams: string = ""): Promise<IBrand[]> {
        const response = await axiosInstance.get(`${this.baseUrl}/search${queryParams}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data || [];
    }
}

export const brandService = new BrandService();
