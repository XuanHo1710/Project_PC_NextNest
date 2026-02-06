"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAttributeService } from "@/services/admin";
import { IProductAttribute } from "@/types";
import { toast } from "react-toastify";

export const productAttributeKeys = {
  all: ["product-attributes"] as const,
  lists: () => [...productAttributeKeys.all, "list"] as const,
  list: (params: string) => [...productAttributeKeys.lists(), params] as const,
  details: () => [...productAttributeKeys.all, "detail"] as const,
  detail: (id: string) => [...productAttributeKeys.details(), id] as const,
};

export const useProductAttributes = (queryParams: string = "") => {
  return useQuery({
    queryKey: productAttributeKeys.list(queryParams),
    queryFn: () =>
      productAttributeService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductAttribute = (id: string) => {
  return useQuery({
    queryKey: productAttributeKeys.detail(id),
    queryFn: () => productAttributeService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IProductAttribute, "_id">) =>
      productAttributeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.lists() });
      toast.success("Tạo thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Tạo thuộc tính thất bại: ${error.message}`);
    },
  });
};

export const useUpdateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IProductAttribute>;
    }) => productAttributeService.update(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: productAttributeKeys.detail(id),
      });
      toast.success("Cập nhật thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật thuộc tính thất bại: ${error.message}`);
    },
  });
};

export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAttributeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productAttributeKeys.lists() });
      toast.success("Xóa thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa thuộc tính thất bại: ${error.message}`);
    },
  });
};
