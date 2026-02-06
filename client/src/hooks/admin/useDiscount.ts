"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discountService } from "@/services/admin";
import { IDiscount } from "@/types/discount";
import { toast } from "react-toastify";

// Query Keys
export const discountKeys = {
  all: ["discounts"] as const,
  lists: () => [...discountKeys.all, "list"] as const,
  list: (params: string) => [...discountKeys.lists(), params] as const,
  details: () => [...discountKeys.all, "detail"] as const,
  detail: (id: string) => [...discountKeys.details(), id] as const,
};

// Hooks for Discounts
export const useDiscounts = (queryParams: string = "") => {
  return useQuery({
    queryKey: discountKeys.list(queryParams),
    queryFn: () => discountService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDiscount = (id: string) => {
  return useQuery({
    queryKey: discountKeys.detail(id),
    queryFn: () => discountService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IDiscount, "_id">) => discountService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast.success("Thêm giảm giá thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm giảm giá thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IDiscount> }) =>
      discountService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: discountKeys.detail(id) });
      toast.success("Cập nhật giảm giá thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật giảm giá thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast.success("Xóa giảm giá thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa giảm giá thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyDiscounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      discountService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.lists() });
      toast.success("Cập nhật nhiều giảm giá thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhiều giảm giá thất bại: ${error.message}`);
      throw error;
    },
  });
};
