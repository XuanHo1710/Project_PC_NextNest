// services/discount.service.ts
import type { IDiscount } from "@/types/discount";
import { BaseService } from "./base.service";

class DiscountService extends BaseService<IDiscount> {
  constructor() {
    super("discount");
  }
}

export const discountService = new DiscountService();
