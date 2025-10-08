// services/cart.client.service.ts
import axios from '@/config/axiosClient'
import { ICart } from '@/types/model.client'

class CartClientService {
    async updateCart(cartId: string, cartUpdate: ICart): Promise<void> {
        const response = await axios.patch(`/cart/` + cartId, {
            ...cartUpdate
        })
        return response.data
    }

    async getOne(guestId: string): Promise<ICart | null> {
        const response = await axios.get(`/cart/` + guestId)
        return response.data
    }
}

export const cartClientService = new CartClientService()