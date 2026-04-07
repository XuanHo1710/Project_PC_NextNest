"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { accountEmployeeService } from "@/services/admin";
import { IAccountEmployee } from "@/types/account-employee";
import { toast } from "react-toastify";

// Query Keys
export const accountEmployeeKeys = {
  all: ["account-employees"] as const,
  lists: () => [...accountEmployeeKeys.all, "list"] as const,
  list: (params: string) => [...accountEmployeeKeys.lists(), params] as const,
  details: () => [...accountEmployeeKeys.all, "detail"] as const,
  detail: (id: string) => [...accountEmployeeKeys.details(), id] as const,
};

// Hooks for Account Employees
export const useAccountEmployees = (queryParams: string = "") => {
  return useQuery({
    queryKey: accountEmployeeKeys.list(queryParams),
    queryFn: () =>
      accountEmployeeService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

export const useAccountEmployee = (id: string) => {
  return useQuery({
    queryKey: accountEmployeeKeys.detail(id),
    queryFn: () => accountEmployeeService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAccountEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IAccountEmployee, "_id">) =>
      accountEmployeeService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: accountEmployeeKeys.lists() });
      toast.success("Thêm tài khoản nhân viên thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm tài khoản nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateAccountEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IAccountEmployee>;
    }) => accountEmployeeService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountEmployeeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: accountEmployeeKeys.detail(id),
      });
      toast.success("Cập nhật tài khoản nhân viên thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật tài khoản nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteAccountEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountEmployeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountEmployeeKeys.lists() });
      toast.success("Xóa tài khoản nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa tài khoản nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyAccountEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      accountEmployeeService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountEmployeeKeys.lists() });
      toast.success("Cập nhật nhiều tài khoản nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(
        `Cập nhật nhiều tài khoản nhân viên thất bại: ${error.message}`,
      );
      throw error;
    },
  });
};
