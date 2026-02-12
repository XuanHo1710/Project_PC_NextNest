// ============== MAIN TYPES INDEX ==============

// ============== API RESPONSE WRAPPERS ==============
// Matches backend transform.interceptor.ts format exactly:
// { statusCode: number, message: string, data: T, timestamp: string }
export interface APIResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

// Paginated response — standardized format from all backend services
// { data: T[], pagination: { currentPage, totalPages, totalItems, itemsPerPage } }
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/** @deprecated Use PaginatedResponse<T> instead */
export type PageResponse<T> = PaginatedResponse<T>;

// Auth
export type {
  IClientUser,
  IAdminUser,
  IClientLoginResponse,
  IAdminLoginResponse,
  ILoginResponse,
  IRegisterResponse,
  IClientLoginDto,
  IClientRegisterDto,
  IAdminLoginDto,
  ILoginDto,
  IRegisterDto,
  IUpdateProfileDto,
  IChangePasswordDto,
  IUpdateAccountSettingsDto,
} from "./auth";

// Account
export type { IAccountGuest, IAddress, IRecentlyViewed } from "./account-guest";
export type { IAccountEmployee, IAccountLogin } from "./account-employee";

// Role
export type { IRole, IPermission } from "./role";

// Product
export type {
  IProduct,
  IProductVariant,
  IProductAttribute,
  IProductAttributeValue,
  IProductAttributeAllowValue,
  IProductPopulated,
  IProductCard,
  IProductListResponse,
  IProductWithPagination,
  IProductDetailResponse,
  ICreateProductDto,
  IUpdateProductDto,
  ICreateProductVariantDto,
  IProductVariantPopulated,
} from "./product";

// Category & Brand
export type { ICategory, ICategoryPreview } from "./category";
export type { IBrand } from "./brand";

// Discount
export type { IDiscount } from "./discount";

// Order & Cart
export type { ICartItem, ICart, IOrderData } from "./order";

// Interaction
export type {
  IProductInteraction,
  IComment,
  IReplyComment,
  ICreateProductInteraction,
  IPostReplyComment,
  IProductComment,
  IProductCommentReply,
  ICommentGuest,
  IRatingStatistics,
  IProductInteractionResponse,
  ICreateCommentDto,
  IUpdateCommentDto,
  IToggleReactionDto,
  IReactionResult,
} from "./interaction";

// Payment
export type { IPaymentTransaction } from "./payment";

// Table (admin utils)
export type { DataType, SelectedContextType } from "./table";

export type { District, Province, Ward } from "./address";
