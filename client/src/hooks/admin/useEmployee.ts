"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountEmployeeService } from "@/services/admin";
import { IAccountEmployee } from "@/types/account-employee";
import { toast } from "react-toastify";

// Query Keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: string) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  noAccount: () => [...employeeKeys.all, "no-account"] as const,
};

// Hooks for Employees
export const useEmployees = (queryParams: string = "") => {
  return useQuery({
    queryKey: employeeKeys.list(queryParams),
    queryFn: () => accountEmployeeService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => accountEmployeeService.getById(id),
    enabled: !!id,
  });
};

export const useEmployeesNoAccount = () => {
  return useQuery({
    queryKey: employeeKeys.noAccount(),
    queryFn: () => accountEmployeeService.getEmployeesNoAccount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IAccountEmployee, "_id">) =>
      accountEmployeeService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.noAccount() });
      toast.success("Thêm nhân viên thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateEmployee = () => {
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
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.noAccount() });
      toast.success("Cập nhật nhân viên thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountEmployeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.noAccount() });
      toast.success("Xóa nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      accountEmployeeService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success("Cập nhật nhiều nhân viên thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật nhiều nhân viên thất bại: ${error.message}`);
      throw error;
    },
  });
};
