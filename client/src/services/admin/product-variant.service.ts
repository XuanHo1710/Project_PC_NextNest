// services/product-variant.service.ts
import { IProductVariant } from "@/types";
import { BaseService } from "./base.service";
import axiosInstance from "@/config/axios";

class ProductVariantService extends BaseService<IProductVariant> {
  constructor() {
    super("product-variant");
  }

  /** Get all variants filtered by product ID */
  async getByProductId(productId: string): Promise<IProductVariant[]> {
    const response = await axiosInstance.get(
      `${this.baseUrl}?productId=${productId}`,
    );
    return response.data;
  }
}

export const productVariantService = new ProductVariantService();
