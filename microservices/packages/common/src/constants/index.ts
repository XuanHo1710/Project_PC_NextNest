/**
 * Common constants shared across all microservices
 */

// Account Status Constants
export const ACCOUNT_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DELETED: "DELETED",
  BANNED: "BANNED",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

// Auth Provider Constants
export const AUTH_PROVIDER = {
  LOCAL: "local",
  GOOGLE: "google",
  FACEBOOK: "facebook",
  GITHUB: "github",
} as const;

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

// User Roles Constants
export const USER_ROLE = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// Token Types
export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "reset_password",
  VERIFY_EMAIL: "verify_email",
} as const;

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

export const MICROSERVICE = {
  AUTH_SERVICE: "AUTH_SERVICE",
  ACCOUNT_GUEST_SERVICE: "ACCOUNT_GUEST_SERVICE",
  ACCOUNT_EMPLOYEE_SERVICE: "ACCOUNT_EMPLOYEE_SERVICE",
  PAYMENT_SERVICE: "PAYMENT_SERVICE",
  PRODUCT_SERVICE: "PRODUCT_SERVICE",
  REDIS_SERVICE: "REDIS_SERVICE",
} as const;

export type MicroserviceName = (typeof MICROSERVICE)[keyof typeof MICROSERVICE];

// Message Patterns
export const MESSAGE_PATTERN = {
  // Auth patterns
  AUTH_LOGIN: "auth.login",
  AUTH_REGISTER: "auth.register",
  AUTH_LOGOUT: "auth.logout",
  AUTH_REFRESH: "auth.refresh",
  AUTH_VERIFY_EMAIL: "auth.verify_email",
  AUTH_RESET_PASSWORD: "auth.reset_password",
  AUTH_VALIDATE_TOKEN: "auth.validate_token",

  // User patterns
  USER_GET_BY_ID: "user.get_by_id",
  USER_GET_BY_EMAIL: "user.get_by_email",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_LIST: "user.list",

  // Product patterns
  PRODUCT_GET_BY_ID: "product.get_by_id",
  PRODUCT_LIST: "product.list",
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",
} as const;

export type MessagePattern =
  (typeof MESSAGE_PATTERN)[keyof typeof MESSAGE_PATTERN];

// HTTP Status Codes (commonly used)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages (Vietnamese)
export const ERROR_MESSAGE = {
  // Auth errors
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
  EMAIL_ALREADY_EXISTS: "Email đã được sử dụng",
  ACCOUNT_NOT_FOUND: "Tài khoản không tồn tại",
  ACCOUNT_SUSPENDED: "Tài khoản đã bị tạm khóa",
  ACCOUNT_DELETED: "Tài khoản đã bị xóa",
  INVALID_TOKEN: "Token không hợp lệ hoặc đã hết hạn",
  UNAUTHORIZED: "Bạn không có quyền truy cập",

  // Validation errors
  REQUIRED_FIELD: "Trường này là bắt buộc",
  INVALID_EMAIL: "Email không hợp lệ",
  INVALID_PHONE: "Số điện thoại không hợp lệ",
  WEAK_PASSWORD:
    "Mật khẩu phải có ít nhất 1 chữ, số, chữ hoa và ký tự đặc biệt",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 8 ký tự",

  // Generic errors
  INTERNAL_ERROR: "Đã có lỗi xảy ra, vui lòng thử lại sau",
  NOT_FOUND: "Không tìm thấy dữ liệu",
  BAD_REQUEST: "Dữ liệu không hợp lệ",
} as const;

// Success Messages (Vietnamese)
export const SUCCESS_MESSAGE = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  REGISTER_SUCCESS: "Đăng ký thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  UPDATE_SUCCESS: "Cập nhật thành công",
  DELETE_SUCCESS: "Xóa thành công",
  CREATE_SUCCESS: "Tạo mới thành công",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_VN: /^(0|\+84)[0-9]{9,10}$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  MONGODB_ID: /^[0-9a-fA-F]{24}$/,
} as const;
