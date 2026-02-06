"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandService } from "@/services/admin/brand.service";
import { IBrand } from "@/types/brand";
import { toast } from "react-toastify";

// Query Keys
export const brandKeys = {
    all: ["brands"] as const,
    lists: () => [...brandKeys.all, "list"] as const,
    list: (params: string) => [...brandKeys.lists(), params] as const,
    details: () => [...brandKeys.all, "detail"] as const,
    detail: (id: string) => [...brandKeys.details(), id] as const,
};

// Hooks for Brands
export const useBrands = (queryParams: string = "") => {
    return useQuery({
        queryKey: brandKeys.list(queryParams),
        queryFn: () => brandService.getAll(queryParams ? `?${queryParams}` : ""),
        staleTime: 0, // Always refetch
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
};

export const useBrand = (id: string) => {
    return useQuery({
        queryKey: brandKeys.detail(id),
        queryFn: () => brandService.getById(id),
        enabled: !!id,
    });
};

export const useCreateBrand = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<IBrand, "_id">) => brandService.create(data),
        onSuccess: async () => {
            // Invalidate and refetch
            await queryClient.invalidateQueries({ queryKey: brandKeys.all });
            await queryClient.refetchQueries({ queryKey: brandKeys.lists() });
            toast.success("Thêm thương hiệu thành công!");
            // Call success callback to close modal
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: Error) => {
            toast.error(`Thêm thương hiệu thất bại: ${error.message}`);
        },
    });
};

export const useUpdateBrand = (onSuccessCallback?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<IBrand> }) =>
            brandService.update(id, data),
        onSuccess: async (_, { id }) => {
            // Invalidate and refetch
            await queryClient.invalidateQueries({ queryKey: brandKeys.all });
            await queryClient.refetchQueries({ queryKey: brandKeys.lists() });
            await queryClient.invalidateQueries({ queryKey: brandKeys.detail(id) });
            toast.success("Cập nhật thương hiệu thành công!");
            // Call success callback to close modal
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        },
        onError: (error: Error) => {
            toast.error(`Cập nhật thương hiệu thất bại: ${error.message}`);
        },
    });
};

// Soft delete - set isDeleted: true instead of actually deleting
export const useDeleteBrand = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => brandService.update(id, { isDeleted: true }),
        onSuccess: async () => {
            // Invalidate and refetch
            await queryClient.invalidateQueries({ queryKey: brandKeys.all });
            await queryClient.refetchQueries({ queryKey: brandKeys.lists() });
            toast.success("Xóa thương hiệu thành công!");
        },
        onError: (error: Error) => {
            toast.error(`Xóa thương hiệu thất bại: ${error.message}`);
        },
    });
};

export const useUpdateManyBrands = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
            brandService.updateMany(ids, typeUpdate),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: brandKeys.all });
            await queryClient.refetchQueries({ queryKey: brandKeys.lists() });
            toast.success("Cập nhật nhiều thương hiệu thành công!");
        },
        onError: (error: Error) => {
            toast.error(`Cập nhật nhiều thương hiệu thất bại: ${error.message}`);
        },
    });
};
