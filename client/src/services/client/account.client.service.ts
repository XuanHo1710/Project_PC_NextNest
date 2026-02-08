import axiosClient from "@/config/axiosClient";
import {
  IAccountGuest,
  IAddress,
  IUpdateProfileDto,
  IChangePasswordDto,
} from "@/types";

class AccountGuestService {
  private baseURL = "/account-guest";

  // ============== Profile APIs ==============

  async getProfile(): Promise<IAccountGuest> {
    const response = await axiosClient.get(`${this.baseURL}/profile-detail`);
    return response as unknown as IAccountGuest;
  }

  async updateProfile(data: IUpdateProfileDto): Promise<IAccountGuest> {
    const response = await axiosClient.patch(`${this.baseURL}/profile`, data);
    return response as unknown as IAccountGuest;
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosClient.post(
      `${this.baseURL}/upload-avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response as unknown as { avatarUrl: string };
  }

  // ============== Password Management ==============

  async changePassword(data: IChangePasswordDto): Promise<void> {
    await axiosClient.post(`${this.baseURL}/change-password`, data);
  }

  // ============== Address Management ==============

  async getAddresses(): Promise<IAddress[]> {
    const response = await axiosClient.get(`${this.baseURL}/addresses`);
    return response as unknown as IAddress[];
  }

  async addAddress(address: Omit<IAddress, "_id">): Promise<IAddress> {
    const response = await axiosClient.post(
      `${this.baseURL}/addresses`,
      address,
    );
    return response as unknown as IAddress;
  }

  async updateAddress(
    addressId: string,
    address: Partial<IAddress>,
  ): Promise<IAddress> {
    const response = await axiosClient.patch(
      `${this.baseURL}/addresses/${addressId}`,
      address,
    );
    return response as unknown as IAddress;
  }

  async deleteAddress(addressId: string): Promise<void> {
    await axiosClient.delete(`${this.baseURL}/addresses/${addressId}`);
  }

  async setDefaultAddress(addressId: string): Promise<void> {
    await axiosClient.patch(
      `${this.baseURL}/addresses/${addressId}/set-default`,
    );
  }

  // ============== Favorites ==============

  async getFavorites(): Promise<string[]> {
    const response = await axiosClient.get(`${this.baseURL}/favorites`);
    return response as unknown as string[];
  }

  async addToFavorites(productId: string): Promise<void> {
    await axiosClient.post(`${this.baseURL}/favorites/${productId}`);
  }

  async removeFromFavorites(productId: string): Promise<void> {
    await axiosClient.delete(`${this.baseURL}/favorites/${productId}`);
  }

  // ============== Recently Viewed ==============

  async getRecentlyViewed(): Promise<
    Array<{ productId: string; viewedAt: string }>
  > {
    const response = await axiosClient.get(`${this.baseURL}/recently-viewed`);
    return response as unknown as Array<{
      productId: string;
      viewedAt: string;
    }>;
  }

  // ============== Statistics ==============

  async getStats(): Promise<{
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    totalReviews: number;
  }> {
    const response = await axiosClient.get(`${this.baseURL}/stats`);
    return response as unknown as {
      totalOrders: number;
      totalSpent: number;
      loyaltyPoints: number;
      totalReviews: number;
    };
  }

  // ============== Account Settings ==============

  async updateAccountSettings(settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    twoFactorEnabled: boolean;
  }): Promise<void> {
    await axiosClient.patch(`${this.baseURL}/settings`, settings);
  }
}

export const accountGuestService = new AccountGuestService();

// Legacy export for backward compatibility
export const accountService = accountGuestService;
