"use client";

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { productManageClientService } from "@/services/client/product-manage.client.service";
import type {
  IProduct,
  IProductVariant,
  IProductAttribute,
  IProductAttributeValue,
} from "@/types";
import { toast } from "react-toastify";

// ============== QUERY KEYS ==============
export const clientProductKeys = {
  myProducts: ["client-my-products"] as const,
  attributes: ["client-product-attributes"] as const,
  allAttributeValues: (page: number, limit: number, search?: string) =>
    ["client-all-attribute-values", page, limit, search] as const,
  attributeValues: (attributeId: string) =>
    ["client-attribute-values", attributeId] as const,
  categories: ["client-categories"] as const,
  brands: ["client-brands"] as const,
};

// ============== HOOKS ==============

/** Fetch all product attributes → PaginatedResponse<IProductAttribute> */
export const useClientProductAttributes = () => {
  return useQuery({
    queryKey: clientProductKeys.attributes,
    queryFn: () => productManageClientService.getProductAttributes(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Fetch ALL attribute values with pagination (no attribute filter) */
export const useClientAllAttributeValues = (
  page = 1,
  limit = 20,
  search?: string,
) => {
  return useQuery({
    queryKey: clientProductKeys.allAttributeValues(page, limit, search),
    queryFn: () =>
      productManageClientService.getAllAttributeValues({
        page,
        limit,
        keyword: search || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch attribute values for multiple selected attributes in parallel.
 * Each query now returns PaginatedResponse<IProductAttributeValue>.
 * Returns a flat array of all values and a per-attribute map.
 */
export const useClientAttributeValuesMap = (selectedAttributeIds: string[]) => {
  const queries = useQueries({
    queries: selectedAttributeIds.map((attrId) => ({
      queryKey: clientProductKeys.attributeValues(attrId),
      queryFn: () =>
        productManageClientService.getAttributeValuesByAttribute(attrId),
      staleTime: 10 * 60 * 1000,
      enabled: !!attrId,
    })),
  });

  // Build a flat list and a per-attribute map
  const valuesMap: Record<string, IProductAttributeValue[]> = {};
  const allValues: IProductAttributeValue[] = [];
  const isLoading = queries.some((q) => q.isLoading);

  selectedAttributeIds.forEach((attrId, idx) => {
    const result = queries[idx]?.data;
    const data = result?.data ?? [];
    valuesMap[attrId] = data;
    allValues.push(...data);
  });

  return { valuesMap, allValues, isLoading, queries };
};

/** Fetch categories for product creation → PaginatedResponse<ICategory> */
export const useClientCategories = () => {
  return useQuery({
    queryKey: clientProductKeys.categories,
    queryFn: () => productManageClientService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });
};

/** Fetch brands for product creation → PaginatedResponse<IBrand> */
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

// ============== PRODUCT ATTRIBUTE CRUD HOOKS ==============

/** Create a product attribute */
export const useClientCreateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<IProductAttribute>) =>
      productManageClientService.createProductAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientProductKeys.attributes,
      });
      toast.success("Tạo thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Tạo thuộc tính thất bại: ${error.message}`);
    },
  });
};

/** Update a product attribute */
export const useClientUpdateProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<IProductAttribute>;
    }) => productManageClientService.updateProductAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientProductKeys.attributes,
      });
      toast.success("Cập nhật thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Cập nhật thất bại: ${error.message}`);
    },
  });
};

/** Delete a product attribute */
export const useClientDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      productManageClientService.deleteProductAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientProductKeys.attributes,
      });
      toast.success("Xóa thuộc tính thành công!");
    },
    onError: (error: Error) => {
      toast.error(`Xóa thất bại: ${error.message}`);
    },
  });
};
