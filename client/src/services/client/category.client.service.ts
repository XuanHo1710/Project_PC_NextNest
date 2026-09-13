// services/category.service.ts
import axios from "@/config/axiosClient";
import { ICategory, ICategoryPreview } from "@/types/category";
import { PaginatedResponse } from "@/types";

class CategoryClientService {
  async getCategoriesPreview(): Promise<ICategoryPreview[]> {
    const response = await axios.get(`/category/preview`);
    return response.data;
  }

  async getCategoriesPage(page = 1, limit = 20): Promise<PaginatedResponse<ICategory>> {
    const response = await axios.get(`/category`, { params: { page, limit } });
    const result = response.data;
    return (
      result?.data
        ? result
        : { data: Array.isArray(result) ? result : [], pagination: null }
    );
  }

  /**
   * Full category list for menus/hover panels. The backend only serves
   * paginated data, so fetch all pages internally (20 per request)
   * instead of one giant limit=1000 call.
   */
  async getAllCategories(): Promise<ICategory[]> {
    const pageSize = 20;
    const first = await this.getCategoriesPage(1, pageSize);
    const result = [...(first.data ?? [])];
    const totalPages = first.pagination?.totalPages ?? 1;
    for (let page = 2; page <= totalPages; page++) {
      const next = await this.getCategoriesPage(page, pageSize);
      result.push(...(next.data ?? []));
    }
    return result;
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    const response = await axios.get(`/category/slug/${slug}`);
    return response.data;
  }
}

export const categoryClientService = new CategoryClientService();
