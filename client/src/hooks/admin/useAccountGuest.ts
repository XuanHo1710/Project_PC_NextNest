"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { accountGuestService } from "@/services/admin/account-guest.service";
import { IAccountGuest } from "@/types/account-guest";
import { toast } from "react-toastify";

// Query Keys
export const accountGuestKeys = {
  all: ["account-guests"] as const,
  lists: () => [...accountGuestKeys.all, "list"] as const,
  list: (params: string) => [...accountGuestKeys.lists(), params] as const,
  details: () => [...accountGuestKeys.all, "detail"] as const,
  detail: (id: string) => [...accountGuestKeys.details(), id] as const,
};

// Hooks for Account Guests
export const useAccountGuests = (queryParams: string = "") => {
  return useQuery({
    queryKey: accountGuestKeys.list(queryParams),
    queryFn: () =>
      accountGuestService.getAll(queryParams ? `?${queryParams}` : ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

export const useAccountGuest = (id: string) => {
  return useQuery({
    queryKey: accountGuestKeys.detail(id),
    queryFn: () => accountGuestService.getById(id),
    enabled: !!id,
  });
};

export const useCreateAccountGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<IAccountGuest, "_id">) =>
      accountGuestService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: accountGuestKeys.lists() });
      toast.success("Thêm tài khoản khách hàng thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Thêm tài khoản khách hàng thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateAccountGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IAccountGuest> }) =>
      accountGuestService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: accountGuestKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: accountGuestKeys.detail(id),
      });
      toast.success("Cập nhật tài khoản khách hàng thành công!");
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật tài khoản khách hàng thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useDeleteAccountGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountGuestService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountGuestKeys.lists() });
      toast.success("Xóa tài khoản khách hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa tài khoản khách hàng thất bại: ${error.message}`);
      throw error;
    },
  });
};

export const useUpdateManyAccountGuests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, typeUpdate }: { ids: string[]; typeUpdate: string }) =>
      accountGuestService.updateMany(ids, typeUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountGuestKeys.lists() });
      toast.success("Cập nhật nhiều tài khoản khách hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(
        `Cập nhật nhiều tài khoản khách hàng thất bại: ${error.message}`,
      );
      throw error;
    },
  });
};
