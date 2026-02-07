// services/client/product-manage.client.service.ts
// Client-side service for managing products (create, edit own products)
import axiosClient from "@/config/axiosClient";
import type {
  IProduct,
  IProductVariant,
  IProductAttribute,
  IProductAttributeValue,
  IProductAttributeAllowValue,
  IBrand,
} from "@/types";

class ProductManageClientService {
  // ============== PRODUCT ==============

  /** Create a new product */
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const response = await axiosClient.post("/product", data);
    return response as unknown as IProduct;
  }

  /** Update own product */
  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const response = await axiosClient.patch(`/product/${id}`, data);
    return response as unknown as IProduct;
  }

  /** Get own products */
  async getMyProducts(params?: Record<string, string>): Promise<IProduct[]> {
    const response = await axiosClient.get("/product", { params });
    return response as unknown as IProduct[];
  }

  // ============== PRODUCT ATTRIBUTES (Read-only) ==============

  /** Get all product attributes */
  async getProductAttributes(): Promise<IProductAttribute[]> {
    const response = await axiosClient.get("/product-attribute");
    return response as unknown as IProductAttribute[];
  }

  // ============== PRODUCT ATTRIBUTE VALUES (Read-only) ==============

  /** Get all attribute values */
  async getProductAttributeValues(): Promise<IProductAttributeValue[]> {
    const response = await axiosClient.get("/product-attribute-value");
    return response as unknown as IProductAttributeValue[];
  }

  /** Get attribute values by attribute ID */
  async getAttributeValuesByAttribute(
    attributeId: string,
  ): Promise<IProductAttributeValue[]> {
    const response = await axiosClient.get(
      `/product-attribute-value/${attributeId}`,
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
    const response = await axiosClient.post("/product-attribute-value", data);
    return response as unknown as IProductAttributeValue;
  }

  // ============== PRODUCT VARIANTS ==============

  /** Create a product variant */
  async createVariant(
    data: Partial<IProductVariant>,
  ): Promise<IProductVariant> {
    const response = await axiosClient.post("/product-variant", data);
    return response as unknown as IProductVariant;
  }

  /** Get variants by product */
  async getVariantsByProduct(productId: string): Promise<IProductVariant[]> {
    const response = await axiosClient.get(`/product-variant/${productId}`);
    return response as unknown as IProductVariant[];
  }

  // ============== PRODUCT ATTRIBUTE ALLOW VALUES ==============

  /** Create allow value */
  async createAllowValue(data: {
    product: string;
    attributeValue: string;
  }): Promise<IProductAttributeAllowValue> {
    const response = await axiosClient.post(
      "/product-attribute-allow-value",
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
    const response = await axiosClient.get("/category");
    return response as unknown as { _id: string; name: string; slug: string }[];
  }

  // ============== BRANDS (Read-only) ==============

  /** Get all brands */
  async getBrands(): Promise<IBrand[]> {
    const response = await axiosClient.get("/brand");
    return response as unknown as IBrand[];
  }
}

export const productManageClientService = new ProductManageClientService();
