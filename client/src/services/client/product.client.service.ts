// services/category.service.ts
import axios from '@/config/axiosClient'
import { IProductCard, IProductWithPagination } from '@/types/model.client.d'


class ProductClientService {
    async getProductsByCategoryId(categoryId: string, page: number = 1, sort: string = ""): Promise<(IProductWithPagination | null)> {
        console.log(sort);


        const response = await axios.get(`product/get-by-category/${categoryId}`, {
            params: { page, sort },
        })
        return response.data
    }

    async searchProducts(keyword: string = ""): Promise<(IProductCard[])> {
        console.log(keyword);

        const response = await axios.get(`product/search`, {
            params: { keyword }
        })
        return response.data
    }

}

export const productClientService = new ProductClientService()
