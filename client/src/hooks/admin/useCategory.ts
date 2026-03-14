"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/admin";
import { ICategory } from "@/types/category";
import { toast } from "react-toastify";

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: string) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Hooks for Categories (with pagination)
export const useCategories = (queryParams: string = "") => {
  return useQuery({
    queryKey: categoryKeys.list(queryParams),
    queryFn: () => categoryService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get ALL categories (no pagination) - for dropdown/select
// Uses a reasonable limit for dropdown purposes
export const useCategoriesAll = () => {
  return useQuery({
    queryKey: [...categoryKeys.all, "dropdown"],
    queryFn: async () => {
      const limit = 200;
      let page = 1;
      let totalPages = 1;
      const allData: ICategory[] = [];

      do {
        const response = await categoryService.getAll(
          `?page=${page}&limit=${limit}&sort=createdAt_desc`,
        );
        allData.push(...(response.data || []));
        totalPages = response.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      return {
        data: allData,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: allData.length,
          itemsPerPage: allData.length,
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ICategory, "_id">) => categoryService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Thêm danh mục thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm danh mục thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICategory> }) =>
      categoryService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      toast.success("Cập nhật danh mục thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật danh mục thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Xóa danh mục thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa danh mục thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      categoryService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success("Cập nhật nhiều danh mục thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhiều danh mục thất bại: ${error.message}`);
      throw error;
    },
  });
};
