// services/product.service.ts
import type { IProduct } from "@/types/product";
import { BaseService } from "./base.service";

class ProductService extends BaseService<IProduct> {
  constructor() {
    super("product");
  }
}

export const productService = new ProductService();
