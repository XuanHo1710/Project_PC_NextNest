// services/product-attribute-value.service.ts
import type { IProductAttributeValue } from "@/types";
import { BaseService } from "./base.service";
import axiosInstance from "@/config/axios";

class ProductAttributeValueService extends BaseService<IProductAttributeValue> {
  constructor() {
    super("product-attribute-value");
  }

  /** Get all values filtered by attribute ID */
  async getByAttributeId(
    attributeId: string,
  ): Promise<IProductAttributeValue[]> {
    const response = await axiosInstance.get(
      `${this.baseUrl}?attributeId=${attributeId}`,
    );
    return response.data;
  }
}

export const productAttributeValueService = new ProductAttributeValueService();
