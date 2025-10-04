// services/category.service.ts
import axios from '@/config/axiosClient'
import { IGuest, IAddress } from '@/types/account'
import { IProductCard } from '@/types/model.client'

class GuestClientService {
    async getProfile(userId: string): Promise<IGuest> {
        const response = await axios.get(`/guest/profile/` + userId)
        return response.data
    }

    async updateProfile(userId: string, data: Partial<IGuest>) {
        const response = await axios.patch(`/guest/profile/` + userId, data)
        return response.data
    }

    // Address management
    async addAddress(userId: string, address: Omit<IAddress, '_id'>) {
        const response = await axios.post(`/guest/profile/${userId}/addresses`, address)
        return response.data
    }

    async updateAddress(userId: string, addressId: string, address: Partial<IAddress>) {
        const response = await axios.patch(`/guest/profile/${userId}/addresses/${addressId}`, address)
        return response.data
    }

    async deleteAddress(userId: string, addressId: string) {
        const response = await axios.delete(`/guest/profile/${userId}/addresses/${addressId}`)
        return response.data
    }

    async setDefaultAddress(userId: string, addressId: string) {
        const response = await axios.patch(`/guest/profile/${userId}/addresses/${addressId}/default`)
        return response.data
    }

    // Password management
    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await axios.patch(`/guest/profile/${userId}/password`, {
            currentPassword,
            newPassword
        })
        return response.data
    }

    async getWishlist(guestId: string): Promise<IProductCard[]> {
        const response = await axios.get(`/guest/profile/${guestId}/wishlist`)
        return response.data
    }
}

export const guestClientService = new GuestClientService()
