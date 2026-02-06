"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productAttributeValueService } from "@/services/admin";
import { IProductAttributeValue } from "@/types";
import { toast } from "react-toastify";

export const productAttributeValueKeys = {
  all: ["product-attribute-values"] as const,
  lists: () => [...productAttributeValueKeys.all, "list"] as const,
  list: (params: string) =>
    [...productAttributeValueKeys.lists(), params] as const,
  byAttribute: (attributeId: string) =>
    [...productAttributeValueKeys.all, "by-attribute", attributeId] as const,
  details: () => [...productAttributeValueKeys.all, "detail"] as const,
  detail: (id: string) => [...productAttributeValueKeys.details(), id] as const,
};

export const useProductAttributeValues = (queryParams: string = "") => {
  return useQuery({
    queryKey: productAttributeValueKeys.list(queryParams),
    queryFn: () =>
      productAttributeValueService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductAttributeValuesByAttribute = (attributeId: string) => {
  return useQuery({
    queryKey: productAttributeValueKeys.byAttribute(attributeId),
    queryFn: () => productAttributeValueService.getByAttributeId(attributeId),
    enabled: !!attributeId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductAttributeValue = (id: string) => {
  return useQuery({
    queryKey: productAttributeValueKeys.detail(id),
    queryFn: () => productAttributeValueService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProductAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IProductAttributeValue, "_id">) =>
      productAttributeValueService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.all,
      });
      toast.success("Tạo giá trị thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Tạo giá trị thuộc tính thất bại: ${error.message}`);
    },
  });
};

export const useUpdateProductAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IProductAttributeValue>;
    }) => productAttributeValueService.update(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.detail(id),
      });
      toast.success("Cập nhật giá trị thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật giá trị thuộc tính thất bại: ${error.message}`);
    },
  });
};

export const useDeleteProductAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productAttributeValueService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: productAttributeValueKeys.all,
      });
      toast.success("Xóa giá trị thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa giá trị thuộc tính thất bại: ${error.message}`);
    },
  });
};
