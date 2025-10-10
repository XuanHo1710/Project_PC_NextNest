// services/category.service.ts
import axios from '@/config/axiosClient'
import { ICreateProductInteraction, IProductInteraction } from '@/types/modal'
import { IProductCard, IProductWithPagination } from '@/types/model.client'


class ProductClientService {
    async getProductsByCategoryId(categoryId: string, page: number = 1, sort: string = ""): Promise<(IProductWithPagination | null)> {
        console.log(categoryId, page, sort)
        const response = await axios.get(`product/get-by-category/${categoryId}`, {
            params: { page, sort },
        })
        return response.data
    }

    async getProductsBySlug(productSlug: string): Promise<(IProductCard)> {
        const response = await axios.get(`product/${productSlug}`)
        return response.data
    }

    async searchProducts(keyword: string = ""): Promise<(IProductCard[])> {
        console.log(keyword);

        const response = await axios.get(`product/search`, {
            params: { keyword }
        })
        return response.data
    }

    async postCommentOnProduct(createProductInteraction: ICreateProductInteraction): Promise<unknown> {
        const response = await axios.post(`product/post-comment`, createProductInteraction)
        return response.data
    }

    async getCommentOfProduct(productId: string, page: number = 1): Promise<IProductInteraction> {
        const response = await axios.get(`product/get-comment/${productId}`, {
            params: { page }
        })
        return response.data
    }

    async replyCommentProduct(commentId: string, guestReplyId: string, content: string, images: string[], isAdminReply: boolean = false): Promise<unknown> {
        const response = await axios.post(`product/reply-comment`, { commentId, guestReplyId, content, images, isAdminReply })
        return response.data
    }

    async interactCommentProduct(commentId: string, guestIdInteractedBy: string, isLike: boolean): Promise<unknown> {
        const response = await axios.post(`product/interact-comment`, { commentId, guestIdInteractedBy, isLike })
        return response.data
    }

    async handleWishlist(guestId: string, productId: string, isWishlisted: boolean): Promise<unknown> {
        const response = await axios.post(`product/handle-favorite`, { guestId, productId, isWishlisted })
        return response.data
    }

    async isWishlistByGuestAndProduct(guestId: string, productId: string): Promise<{ isWishlisted: boolean }> {
        const response = await axios.get(`product/get-wishlist/${guestId}`, {
            params: { productId }
        })
        return response.data
    }

}

export const productClientService = new ProductClientService()
