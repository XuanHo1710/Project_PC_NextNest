"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService, ISetting } from "@/services/admin/settings.service";
import { toast } from "react-toastify";

export const settingsKeys = {
  all: ["admin-settings"] as const,
  byKey: (key: string) => [...settingsKeys.all, key] as const,
};

export const useSettings = () => {
  return useQuery<ISetting[]>({
    queryKey: settingsKeys.all,
    queryFn: () => settingsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSettingByKey = (key: string) => {
  return useQuery<ISetting>({
    queryKey: settingsKeys.byKey(key),
    queryFn: () => settingsService.getByKey(key),
    enabled: !!key,
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, any> }) =>
      settingsService.update(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success("Đã lưu cài đặt thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Lưu cài đặt thất bại: ${error.message}`);
    },
  });
};
