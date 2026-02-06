// services/category.service.ts
import type { ICategory } from "@/types/category";
import { BaseService } from "./base.service";

class CategoryService extends BaseService<ICategory> {
  constructor() {
    super("category");
  }
}

export const categoryService = new CategoryService();
