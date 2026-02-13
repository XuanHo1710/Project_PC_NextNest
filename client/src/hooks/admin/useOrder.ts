"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/admin/order.service";
import { toast } from "react-toastify";

// Query Keys
export const orderKeys = {
  all: ["admin-orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: string) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, "stats"] as const,
};

// Get all orders with filters
export const useAdminOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentType?: string;
  search?: string;
}) => {
  const key = JSON.stringify(params || {});
  return useQuery({
    queryKey: orderKeys.list(key),
    queryFn: () => orderService.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get order by ID
export const useAdminOrder = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateStatus(id, status),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      toast.success("Cập nhật trạng thái đơn hàng thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật thất bại: ${error.message}`);
    },
  });
};

// Confirm COD payment
export const useConfirmCodPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      orderService.confirmCodPayment(id, amount),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      toast.success("Xác nhận thanh toán COD thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xác nhận thất bại: ${error.message}`);
    },
  });
};

// Get dashboard stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => orderService.getStats(),
    staleTime: 60 * 1000, // 1 minute
  });
};
