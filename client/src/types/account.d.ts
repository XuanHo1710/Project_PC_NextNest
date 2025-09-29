// Account Guest Types
export interface IAccountGuest {
    _id: string;
    guestId: string | IGuest;
    email: string;
    authProvider: 'local' | 'google';
    isEmailVerified: boolean;
    accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    isActive: boolean;
    twoFactorEnabled: boolean;
    lastLoginAt?: string;
    loginCount: number;
    lastLoginIP?: string;
    registrationSource: 'WEB' | 'MOBILE' | 'ADMIN';
    termsAccepted: boolean;
    termsAcceptedAt?: string;
    privacyPolicyAccepted: boolean;
    privacyPolicyAcceptedAt?: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    createdAt: string;
    updatedAt: string;
}

// Guest Profile Types (personal information)
export interface IGuest {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
    avatar?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    birthday?: string;
    isActive: boolean;
    isVerified: boolean;

    // Addresses
    addresses: IAddress[];

    // Shopping behavior
    favoriteProducts: string[];
    recentlyViewed: IRecentlyViewed[];

    // Statistics
    totalOrders: number;
    totalSpent: number;
    totalReviews: number;
    loyaltyPoints: number;

    createdAt: string;
    updatedAt: string;
}

export interface IAddress {
    _id?: string; // MongoDB ObjectId
    label: string;
    province: { code: number; name: string };
    district: { code: number; name: string };
    ward: { code: number; name: string };
    detailAddress: string;
    isDefault: boolean;
}

export interface IRecentlyViewed {
    productId: string;
    viewedAt: string;
}

// API Response Types
export interface ILoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        fullname: string;
        avatar?: string;
        authProvider: string;
        accountStatus: string;
        isEmailVerified: boolean;
        phone?: string;
        gender?: string;
    };
}

export interface IRegisterResponse {
    guest: IGuest;
    account: IAccountGuest;
}

// DTOs for API calls
export interface IRegisterDto {
    fullname: string;
    email: string;
    password: string;
    phone: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    termsAccepted: boolean;
    privacyPolicyAccepted: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
}

export interface ILoginDto {
    email: string;
    password: string;
}

export interface IUpdateProfileDto {
    fullname?: string;
    phone?: string;
    avatar?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthday?: string;
}

export interface IUpdateAccountSettingsDto {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    twoFactorEnabled?: boolean;
}

export interface IChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Account Statistics
export interface IAccountStatistics {
    totalAccounts: number;
    activeAccounts: number;
    pendingAccounts: number;
    suspendedAccounts: number;
    verifiedEmails: number;
    googleUsers: number;
    localUsers: number;
}