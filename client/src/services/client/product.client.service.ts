// services/category.service.ts
import axios from '@/config/axiosClient'
import { IProductCard, IProductWithPagination } from '@/types/model.client'


class ProductClientService {
    async getProductsByCategoryId(categoryId: string, page: number = 1, sort: string = ""): Promise<(IProductWithPagination | null)> {
        const response = await axios.get(`product/get-by-category/${categoryId}`, {
            params: { page, sort },
        })
        return response.data
    }

    async getProductsById(productId: string): Promise<(IProductCard)> {
        const response = await axios.get(`product/${productId}`)
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
