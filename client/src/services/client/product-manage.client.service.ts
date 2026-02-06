// services/client/product-manage.client.service.ts
// Client-side service for managing products (create, edit own products)
import axiosClient from "@/config/axiosClient";
import type {
  IProduct,
  IProductVariant,
  IProductAttribute,
  IProductAttributeValue,
} from "@/types";

export interface IProductAttributeAllowValue {
  _id: string;
  product: string;
  attributeValue: string;
  isDeleted?: boolean;
}

class ProductManageClientService {
  // ============== PRODUCT ==============

  /** Create a new product */
  async createProduct(
    data: Partial<IProduct>,
  ): Promise<{ data: IProduct; status: number }> {
    const response = await axiosClient.post("/products", data);
    return { data: response as unknown as IProduct, status: 200 };
  }

  /** Update own product */
  async updateProduct(
    id: string,
    data: Partial<IProduct>,
  ): Promise<{ data: IProduct; status: number }> {
    const response = await axiosClient.patch(`/products/${id}`, data);
    return { data: response as unknown as IProduct, status: 200 };
  }

  /** Get own products */
  async getMyProducts(params?: Record<string, string>): Promise<IProduct[]> {
    const response = await axiosClient.get("/products/my", { params });
    return response as unknown as IProduct[];
  }

  // ============== PRODUCT ATTRIBUTES (Read-only) ==============

  /** Get all product attributes */
  async getProductAttributes(): Promise<IProductAttribute[]> {
    const response = await axiosClient.get("/product-attributes");
    return response as unknown as IProductAttribute[];
  }

  // ============== PRODUCT ATTRIBUTE VALUES (Read-only) ==============

  /** Get all attribute values */
  async getProductAttributeValues(): Promise<IProductAttributeValue[]> {
    const response = await axiosClient.get("/product-attribute-values");
    return response as unknown as IProductAttributeValue[];
  }

  /** Get attribute values by attribute ID */
  async getAttributeValuesByAttribute(
    attributeId: string,
  ): Promise<IProductAttributeValue[]> {
    const response = await axiosClient.get(
      `/product-attribute-values?attributeId=${attributeId}`,
    );
    return response as unknown as IProductAttributeValue[];
  }

  /** Create a new attribute value */
  async createAttributeValue(data: {
    value: string;
    label: string;
    attribute: string;
    colorHex?: string;
    imageUrl?: string;
  }): Promise<IProductAttributeValue> {
    const response = await axiosClient.post("/product-attribute-values", data);
    return response as unknown as IProductAttributeValue;
  }

  // ============== PRODUCT VARIANTS ==============

  /** Create a product variant */
  async createVariant(
    data: Partial<IProductVariant>,
  ): Promise<IProductVariant> {
    const response = await axiosClient.post("/product-variants", data);
    return response as unknown as IProductVariant;
  }

  /** Get variants by product */
  async getVariantsByProduct(productId: string): Promise<IProductVariant[]> {
    const response = await axiosClient.get(
      `/product-variants?productId=${productId}`,
    );
    return response as unknown as IProductVariant[];
  }

  // ============== PRODUCT ATTRIBUTE ALLOW VALUES ==============

  /** Create allow value */
  async createAllowValue(data: {
    product: string;
    attributeValue: string;
  }): Promise<IProductAttributeAllowValue> {
    const response = await axiosClient.post(
      "/product-attribute-allow-values",
      data,
    );
    return response as unknown as IProductAttributeAllowValue;
  }

  /** Bulk create allow values for a product */
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

  // ============== CATEGORIES (Read-only) ==============

  /** Get all categories */
  async getCategories(): Promise<
    { _id: string; name: string; slug: string }[]
  > {
    const response = await axiosClient.get("/categories");
    return response as unknown as { _id: string; name: string; slug: string }[];
  }
}

export const productManageClientService = new ProductManageClientService();
