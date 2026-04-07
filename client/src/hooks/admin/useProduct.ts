"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { productService } from "@/services/admin";
import { IProduct } from "@/types/product";
import { toast } from "react-toastify";

// Query Keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: string) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hooks for Products
export const useProducts = (queryParams: string = "") => {
  return useQuery({
    queryKey: productKeys.list(queryParams),
    queryFn: () => productService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // Keep old data while fetching new page
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IProduct, "_id">) => productService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Thêm sản phẩm thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm sản phẩm thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IProduct> }) =>
      productService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      toast.success("Cập nhật sản phẩm thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật sản phẩm thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Xóa sản phẩm thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa sản phẩm thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      productService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Cập nhật nhiều sản phẩm thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhiều sản phẩm thất bại: ${error.message}`);
      throw error;
    },
  });
};
