import axiosClient from '@/config/axiosClient';
import {
    ILoginDto,
    IRegisterDto,
    ILoginResponse,
    IRegisterResponse,
    IUpdateProfileDto,
    IUpdateAccountSettingsDto,
    IChangePasswordDto,
    IGuest,
    IAccountGuest
} from '@/types/account';

class AccountService {
    private baseURL = '/client/auth';

    // Authentication APIs
    async login(loginData: ILoginDto): Promise<ILoginResponse> {
        const response = await axiosClient.post(`${this.baseURL}/login`, loginData);
        return response.data;
    }

    async register(registerData: IRegisterDto): Promise<IRegisterResponse> {
        const response = await axiosClient.post(`${this.baseURL}/register`, registerData);
        return response.data;
    }

    async googleLogin(): Promise<void> {
        // Redirect to Google OAuth
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}${this.baseURL}/google`;
    }

    async logout(): Promise<void> {
        await axiosClient.post(`${this.baseURL}/logout`);
    }

    async refreshToken(): Promise<{ access_token: string }> {
        const response = await axiosClient.post(`${this.baseURL}/refresh`);
        return response.data;
    }

    async getCurrentUser(): Promise<ILoginResponse['user']> {
        const response = await axiosClient.get(`${this.baseURL}/profile`);
        return response.data;
    }

    // Email verification
    async verifyEmail(token: string): Promise<void> {
        await axiosClient.post(`${this.baseURL}/verify-email`, { token });
    }

    async resendVerificationEmail(): Promise<void> {
        await axiosClient.post(`${this.baseURL}/resend-verification`);
    }

    // Password management
    async changePassword(passwordData: IChangePasswordDto): Promise<void> {
        await axiosClient.post(`${this.baseURL}/change-password`, passwordData);
    }

    async forgotPassword(email: string): Promise<void> {
        await axiosClient.post(`${this.baseURL}/forgot-password`, { email });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await axiosClient.post(`${this.baseURL}/reset-password`, {
            token,
            newPassword
        });
    }

    // Profile management
    async updateProfile(profileData: IUpdateProfileDto): Promise<IGuest> {
        const response = await axiosClient.patch(`${this.baseURL}/profile`, profileData);
        return response.data;
    }

    async updateAccountSettings(settingsData: IUpdateAccountSettingsDto): Promise<IAccountGuest> {
        const response = await axiosClient.patch(`${this.baseURL}/account-settings`, settingsData);
        return response.data;
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await axiosClient.post(`${this.baseURL}/upload-avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Address management
    async getAddresses(): Promise<IGuest['addresses']> {
        const response = await axiosClient.get(`${this.baseURL}/addresses`);
        return response.data;
    }

    async addAddress(address: Omit<IGuest['addresses'][0], 'id'>): Promise<IGuest['addresses'][0]> {
        const response = await axiosClient.post(`${this.baseURL}/addresses`, address);
        return response.data;
    }

    async updateAddress(addressId: string, address: Partial<IGuest['addresses'][0]>): Promise<IGuest['addresses'][0]> {
        const response = await axiosClient.patch(`${this.baseURL}/addresses/${addressId}`, address);
        return response.data;
    }

    async deleteAddress(addressId: string): Promise<void> {
        await axiosClient.delete(`${this.baseURL}/addresses/${addressId}`);
    }

    async setDefaultAddress(addressId: string): Promise<void> {
        await axiosClient.patch(`${this.baseURL}/addresses/${addressId}/set-default`);
    }

    // Account statistics (for user dashboard)
    async getAccountStats(): Promise<{
        totalOrders: number;
        totalSpent: number;
        loyaltyPoints: number;
        totalReviews: number;
    }> {
        const response = await axiosClient.get(`${this.baseURL}/stats`);
        return response.data;
    }

    // Recent activity
    async getRecentActivity(): Promise<Array<{
        id: string;
        type: string;
        description: string;
        createdAt: string;
    }>> {
        const response = await axiosClient.get(`${this.baseURL}/recent-activity`);
        return response.data;
    }

    // Two-factor authentication
    async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
        const response = await axiosClient.post(`${this.baseURL}/2fa/enable`);
        return response.data;
    }

    async verifyTwoFactor(token: string): Promise<{ backupCodes: string[] }> {
        const response = await axiosClient.post(`${this.baseURL}/2fa/verify`, { token });
        return response.data;
    }

    async disableTwoFactor(token: string): Promise<void> {
        await axiosClient.post(`${this.baseURL}/2fa/disable`, { token });
    }

    // Account deletion
    async requestAccountDeletion(): Promise<void> {
        await axiosClient.post(`${this.baseURL}/request-deletion`);
    }

    async cancelAccountDeletion(): Promise<void> {
        await axiosClient.post(`${this.baseURL}/cancel-deletion`);
    }
}

export const accountService = new AccountService();