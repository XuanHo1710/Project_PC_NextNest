// services/discount.service.ts
import type { IDiscount } from "@/types/modal.d"
import { BaseService } from "./base.service"

class DiscountService extends BaseService<IDiscount> {
  constructor() {
    super("discount")
  }
}

export const discountService = new DiscountService()
