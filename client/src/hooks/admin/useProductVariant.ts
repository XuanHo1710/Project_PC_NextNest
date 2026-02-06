"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productVariantService } from "@/services/admin";
import { IProductVariant } from "@/types";
import { toast } from "react-toastify";

export const productVariantKeys = {
  all: ["product-variants"] as const,
  lists: () => [...productVariantKeys.all, "list"] as const,
  byProduct: (productId: string) =>
    [...productVariantKeys.all, "by-product", productId] as const,
  details: () => [...productVariantKeys.all, "detail"] as const,
  detail: (id: string) => [...productVariantKeys.details(), id] as const,
};

export const useProductVariants = (queryParams: string = "") => {
  return useQuery({
    queryKey: productVariantKeys.lists(),
    queryFn: () =>
      productVariantService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductVariantsByProduct = (productId: string) => {
  return useQuery({
    queryKey: productVariantKeys.byProduct(productId),
    queryFn: () => productVariantService.getByProductId(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IProductVariant, "_id">) =>
      productVariantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productVariantKeys.all });
      toast.success("Tạo biến thể thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Tạo biến thể thất bại: ${error.message}`);
    },
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IProductVariant>;
    }) => productVariantService.update(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: productVariantKeys.all });
      queryClient.invalidateQueries({
        queryKey: productVariantKeys.detail(id),
      });
      toast.success("Cập nhật biến thể thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật biến thể thất bại: ${error.message}`);
    },
  });
};

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productVariantService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productVariantKeys.all });
      toast.success("Xóa biến thể thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa biến thể thất bại: ${error.message}`);
    },
  });
};
