"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productManageClientService } from "@/services/client/product-manage.client.service";
import type { IProduct, IProductVariant } from "@/types";
import { toast } from "react-toastify";

// ============== QUERY KEYS ==============
export const clientProductKeys = {
  myProducts: ["client-my-products"] as const,
  attributes: ["client-product-attributes"] as const,
  attributeValues: ["client-product-attribute-values"] as const,
  categories: ["client-categories"] as const,
  brands: ["client-brands"] as const,
};

// ============== HOOKS ==============

/** Fetch all product attributes (for selection in create wizard) */
export const useClientProductAttributes = () => {
  return useQuery({
    queryKey: clientProductKeys.attributes,
    queryFn: () => productManageClientService.getProductAttributes(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Fetch all attribute values (for selection in create wizard) */
export const useClientProductAttributeValues = () => {
  return useQuery({
    queryKey: clientProductKeys.attributeValues,
    queryFn: () => productManageClientService.getProductAttributeValues(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Fetch categories for product creation */
export const useClientCategories = () => {
  return useQuery({
    queryKey: clientProductKeys.categories,
    queryFn: () => productManageClientService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Fetch brands for product creation */
export const useClientBrands = () => {
  return useQuery({
    queryKey: clientProductKeys.brands,
    queryFn: () => productManageClientService.getBrands(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Create a new product */
export const useClientCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<IProduct>) =>
      productManageClientService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientProductKeys.myProducts });
    },
    onError: (error: Error) => {
      toast.error(`Tạo sản phẩm thất bại: ${error.message}`);
    },
  });
};

/** Create a product variant */
export const useClientCreateVariant = () => {
  return useMutation({
    mutationFn: (data: Partial<IProductVariant>) =>
      productManageClientService.createVariant(data),
    onError: (error: Error) => {
      toast.error(`Tạo biến thể thất bại: ${error.message}`);
    },
  });
};
