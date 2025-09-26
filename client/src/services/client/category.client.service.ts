// services/category.service.ts
import axios from '@/config/axiosClient'
import { ICategory } from '@/types/modal.d'
import { ICategoryPreview } from '@/types/model.client.d'

class CategoryClientService {
    async getCategoriesPreview(): Promise<ICategoryPreview[]> {
        const response = await axios.get(`/category/preview`)
        return response.data
    }

    async getAllCategories(): Promise<ICategory[]> {
        const response = await axios.get(`/category`)
        return response.data
    }
}

export const categoryClientService = new CategoryClientService()
