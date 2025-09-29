// services/category.service.ts
import axios from '@/config/axiosClient'
import { ICart } from '@/types/model.client'

class CartClientService {
    async getCart(): Promise<ICart> {
        const response = await axios.get(`/cart`)
        return response.data
    }

    async updateCart(cartId: string, productId: string, quantity: number): Promise<void> {
        const response = await axios.patch(`/cart/` + cartId, {
            productId: productId,
            quantity: quantity
        })
        return response.data
    }

    async clearCart(cartId: string): Promise<void> {
        const response = await axios.delete(`/cart/` + cartId)
        return response.data
    }
}

export const cartClientService = new CartClientService()
