// ============== ACCOUNT GUEST ==============
// Based on: auth-service/account-guest/entities/account-guest.entity.ts

// Shared address schema
export interface IAddress {
  _id?: string;
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

export interface IAccountGuest {
  _id: string;
  email: string;
  avatar?: string;
  googleId?: string;
  authProvider: "local" | "google";
  isEmailVerified: boolean;
  accountStatus: "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";
  isActive: boolean;
  otpCodeForEmail?: number;
  loginInformation: Array<{
    loginCount: number;
    loginAt: string;
  }>;
  fullname: string;
  phone?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  addresses: IAddress[];
  favoriteProducts: string[];
  recentlyViewed: IRecentlyViewed[];
  totalOrders: number;
  totalSpent: number;
  totalReviews: number;
  loyaltyPoints: number;
  adminNotes?: string;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
