// services/client/product-manage.client.service.ts
// Client-side service for managing products (create, edit own products)
//
// Data flow:
//   axiosClient interceptor returns response.data = gateway envelope
//   { statusCode, message, data: <payload>, timestamp }
//   → service extracts actual payload via response.data
//
// ALL findAll endpoints now return PaginatedResponse<T>:
//   { data: T[], pagination: { currentPage, totalPages, totalItems, itemsPerPage } }
//
// Gateway endpoints (client):
//   GET  /product-attribute                 → PaginatedResponse<IProductAttribute>
//   GET  /product-attribute-value/:attrId   → PaginatedResponse<IProductAttributeValue>
//   POST /product-attribute-value           → IProductAttributeValue
//   GET  /brand                             → PaginatedResponse<IBrand>
//   GET  /category                          → PaginatedResponse<ICategory>
//   POST /product                           → IProduct
//   PATCH /product/:id                      → IProduct
//   POST /product-variant                   → IProductVariant
//   GET  /product-variant/:productId        → PaginatedResponse<IProductVariant>
//   POST /product-attribute-allow-value     → IProductAttributeAllowValue

import axiosClient from "@/config/axiosClient";
import type {
  IProduct,
  IProductVariant,
  IProductAttribute,
  IProductAttributeValue,
  IProductAttributeAllowValue,
  IBrand,
  ICategory,
} from "@/types";
import { PaginatedResponse } from "@/types/common";

class ProductManageClientService {
  // ============== PRODUCT ==============

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const response = await axiosClient.post("/product", data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const response = await axiosClient.patch(`/product/${id}`, data);
    return response.data;
  }

  async getMyProducts(
    params?: Record<string, string>,
  ): Promise<PaginatedResponse<IProduct>> {
    const response = await axiosClient.get("/product", { params });
    return response.data;
  }

  // ============== PRODUCT ATTRIBUTES ==============

  async getProductAttributes(): Promise<PaginatedResponse<IProductAttribute>> {
    const response = await axiosClient.get("/product-attribute");
    return response.data;
  }

  async createProductAttribute(
    data: Partial<IProductAttribute>,
  ): Promise<IProductAttribute> {
    const response = await axiosClient.post("/product-attribute", data);
    return response.data;
  }

  async updateProductAttribute(
    id: string,
    data: Partial<IProductAttribute>,
  ): Promise<IProductAttribute> {
    const response = await axiosClient.patch(`/product-attribute/${id}`, data);
    return response.data;
  }

  async deleteProductAttribute(id: string): Promise<void> {
    await axiosClient.delete(`/product-attribute/${id}`);
  }
  // ============== ATTRIBUTES ==============

  async getAttributes(params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<PaginatedResponse<IProductAttribute>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.keyword) query.set("search", params.keyword);
    const qs = query.toString();
    const response = await axiosClient.get(
      `/product-attribute${qs ? `?${qs}` : ""}`,
    );
    return response.data;
  }
  // ============== PRODUCT ATTRIBUTE VALUES ==============

  async getAttributeValuesByAttribute(
    attributeId: string,
  ): Promise<PaginatedResponse<IProductAttributeValue>> {
    const response = await axiosClient.get(
      `/product-attribute-value/${attributeId}`,
    );
    return response.data;
  }

  async createAttributeValue(data: {
    value: string;
    label: string;
    attribute: string;
    colorHex?: string;
    imageUrl?: string;
  }): Promise<IProductAttributeValue> {
    const response = await axiosClient.post("/product-attribute-value", data);
    return response.data;
  }

  // ============== PRODUCT VARIANTS ==============

  async createVariant(
    data: Partial<IProductVariant>,
  ): Promise<IProductVariant> {
    const response = await axiosClient.post("/product-variant", data);
    return response.data;
  }

  async getVariantsByProduct(
    productId: string,
  ): Promise<PaginatedResponse<IProductVariant>> {
    const response = await axiosClient.get(`/product-variant/${productId}`);
    return response.data;
  }

  // ============== PRODUCT ATTRIBUTE ALLOW VALUES ==============

  async createAllowValue(data: {
    product: string;
    attributeValue: string;
  }): Promise<IProductAttributeAllowValue> {
    const response = await axiosClient.post(
      "/product-attribute-allow-value",
      data,
    );
    return response.data;
  }

  async bulkCreateAllowValues(
    productId: string,
    attributeValueIds: string[],
  ): Promise<IProductAttributeAllowValue[]> {
    const results: IProductAttributeAllowValue[] = [];
    for (const attributeValue of attributeValueIds) {
      const result = await this.createAllowValue({
        product: productId,
        attributeValue,
      });
      results.push(result);
    }
    return results;
  }

  // ============== CATEGORIES ==============

  async getCategories(params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<PaginatedResponse<ICategory>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.keyword) query.set("search", params.keyword);
    const qs = query.toString();
    const response = await axiosClient.get(`/category${qs ? `?${qs}` : ""}`);
    return response.data;
  }

  // ============== BRANDS ==============

  async getBrands(params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<PaginatedResponse<IBrand>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.keyword) query.set("keyword", params.keyword);
    const qs = query.toString();
    const response = await axiosClient.get(`/brand${qs ? `?${qs}` : ""}`);
    return response.data;
  }
}

export const productManageClientService = new ProductManageClientService();
