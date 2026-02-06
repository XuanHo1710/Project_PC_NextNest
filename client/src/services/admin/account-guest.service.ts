import type { IAccountGuest } from "@/types/account-guest";
import axiosInstance from "@/config/axios";

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

class AccountGuestService {
    protected baseUrl: string = "account-guest";

    async getAll(queryParams: string = ""): Promise<IAccountGuest[]> {
        const response = await axiosInstance.get(`${this.baseUrl}${queryParams}`);
        // Backend returns { data, pagination }
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data || [];
    }

    async getById(id: string): Promise<IAccountGuest> {
        const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    async create(data: Omit<IAccountGuest, "_id">): Promise<{ data: IAccountGuest; status: number }> {
        const response = await axiosInstance.post(this.baseUrl, data);
        return { data: response.data, status: response.status };
    }

    async update(id: string, data: Partial<IAccountGuest>): Promise<{ data: IAccountGuest; status: number }> {
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
}

export const accountGuestService = new AccountGuestService();
