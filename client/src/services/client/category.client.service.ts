// services/category.service.ts
import axios from "@/config/axiosClient";
import { ICategory, ICategoryPreview } from "@/types/category";

class CategoryClientService {
  async getCategoriesPreview(): Promise<ICategoryPreview[]> {
    const response = await axios.get(`/category/preview`);
    return response.data;
  }

  async getAllCategories(): Promise<ICategory[]> {
    const response = await axios.get(`/category`);
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    const response = await axios.get(`/category/` + slug);
    return response.data;
  }
}

export const categoryClientService = new CategoryClientService();
