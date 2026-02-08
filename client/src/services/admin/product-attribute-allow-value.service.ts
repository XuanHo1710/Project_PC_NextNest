// services/product-attribute-allow-value.service.ts
import axiosInstance from "@/config/axios";
import { PaginatedResponse } from "@/types/common";

export interface IProductAttributeAllowValue {
  _id: string;
  product: string;
  attributeValue: string;
  isDeleted?: boolean;
}

class ProductAttributeAllowValueService {
  private baseUrl = "product-attribute-allow-value";

  async getAll(): Promise<PaginatedResponse<IProductAttributeAllowValue>> {
    const response = await axiosInstance.get(this.baseUrl);
    return response.data;
  }

  async getByProductId(
    productId: string,
  ): Promise<PaginatedResponse<IProductAttributeAllowValue>> {
    const response = await axiosInstance.get(
      `${this.baseUrl}?productId=${productId}`,
    );
    return response.data;
  }

  async create(data: {
    product: string;
    attributeValue: string;
  }): Promise<IProductAttributeAllowValue> {
    const response = await axiosInstance.post(this.baseUrl, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  /** Bulk create allow values for a product */
  async bulkCreate(
    productId: string,
    attributeValueIds: string[],
  ): Promise<IProductAttributeAllowValue[]> {
    const results: IProductAttributeAllowValue[] = [];
    for (const attributeValue of attributeValueIds) {
      const result = await this.create({ product: productId, attributeValue });
      results.push(result);
    }
    return results;
  }
}

export const productAttributeAllowValueService =
  new ProductAttributeAllowValueService();
