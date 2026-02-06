"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/admin";
import { IRole } from "@/types/role";
import { toast } from "react-toastify";

// Query Keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (params: string) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Hooks for Roles
export const useRoles = (queryParams: string = "") => {
  return useQuery({
    queryKey: roleKeys.list(queryParams),
    queryFn: () => roleService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IRole, "_id">) => roleService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Thêm vai trò thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm vai trò thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IRole> }) =>
      roleService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      toast.success("Cập nhật vai trò thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật vai trò thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Xóa vai trò thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa vai trò thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      roleService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast.success("Cập nhật nhiều vai trò thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhiều vai trò thất bại: ${error.message}`);
      throw error;
    },
  });
};
