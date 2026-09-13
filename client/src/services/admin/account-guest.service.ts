import type { IAccountGuest } from "@/types/account-guest";
import axiosInstance from "@/config/axios";
import { asEnvelope } from "./base.service";

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

    async getAll(queryParams: string = ""): Promise<PaginatedResponse<IAccountGuest>> {
        const response = asEnvelope<PaginatedResponse<IAccountGuest>>(
            await axiosInstance.get(`${this.baseUrl}${queryParams}`)
        );
        return response.data as PaginatedResponse<IAccountGuest>;
    }

    async getById(id: string): Promise<IAccountGuest> {
        const response = asEnvelope<IAccountGuest>(
            await axiosInstance.get(`${this.baseUrl}/${id}`)
        );
        return response.data as IAccountGuest;
    }

    async create(data: Omit<IAccountGuest, "_id">): Promise<{ data: IAccountGuest; status: number }> {
        const response = asEnvelope<IAccountGuest>(await axiosInstance.post(this.baseUrl, data));
        return { data: response.data as IAccountGuest, status: response.statusCode };
    }

    async update(id: string, data: Partial<IAccountGuest>): Promise<{ data: IAccountGuest; status: number }> {
        const response = asEnvelope<IAccountGuest>(
            await axiosInstance.patch(`${this.baseUrl}/${id}`, data)
        );
        return { data: response.data as IAccountGuest, status: response.statusCode };
    }

    async delete(id: string): Promise<{ status: number }> {
        const response = asEnvelope<IAccountGuest>(
            await axiosInstance.delete(`${this.baseUrl}/${id}`)
        );
        return { status: response.statusCode };
    }

    async updateMany(ids: string[], typeUpdate: string): Promise<{ status: number }> {
        const response = asEnvelope<IAccountGuest>(
            await axiosInstance.patch(`${this.baseUrl}/updateMany`, {
                ids,
                typeUpdate,
            })
        );
        return { status: response.statusCode };
    }
}

export const accountGuestService = new AccountGuestService();
