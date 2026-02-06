// services/product-attribute.service.ts
import type { IProductAttribute } from "@/types";
import { BaseService } from "./base.service";

class ProductAttributeService extends BaseService<IProductAttribute> {
  constructor() {
    super("product-attribute");
  }
}

export const productAttributeService = new ProductAttributeService();
