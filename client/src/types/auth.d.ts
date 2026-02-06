// ============== AUTH TYPES ==============
// Auth responses, user state, and DTOs

// Re-export commonly needed types
export type { IAccountGuest, IAddress } from "./account-guest";
export type { IAccountEmployee } from "./account-employee";

// ============== CLIENT USER STATE (For frontend store) ==============
export interface IClientUser {
  _id: string;
  id: string;
  email: string;
  fullname: string;
  avatar?: string;
  authProvider: "local" | "google";
  accountStatus: string;
  isEmailVerified?: boolean;
  phone?: string;
  gender?: string;
}

export interface IAdminUser {
  _id: string;
  IDEmp: string;
  name: string;
  email: string;
  roleId: string;
  avatar?: string;
}

// ============== LOGIN RESPONSES ==============
export interface IClientLoginResponse {
  access_token: string;
  payload: {
    _id: string;
    email: string;
    avatar?: string;
    accountStatus: string;
    fullname: string;
    authProvider: "local" | "google";
  };
}

export interface IAdminLoginResponse {
  access_token: string;
  payload: {
    _id: string;
    IDEmp: string;
    username: string;
    roleId: string;
    employeeId: string;
  };
}

// Backward-compatible login response
export interface ILoginResponse {
  access_token: string;
  payload: {
    _id: string;
    email: string;
    avatar?: string;
    accountStatus: string;
    fullname: string;
    authProvider: "local" | "google";
  };
  user: {
    id: string;
    email: string;
    fullname: string;
    avatar?: string;
    authProvider: string;
    accountStatus: string;
    isEmailVerified?: boolean;
    phone?: string;
    gender?: string;
  };
}

export interface IRegisterResponse {
  message: string;
  accountGuest: {
    _id: string;
    email: string;
    fullname: string;
  };
}

// ============== DTOs ==============
export interface IClientLoginDto {
  email: string;
  password: string;
}

export interface IClientRegisterDto {
  email: string;
  password: string;
  fullname: string;
  phone: string;
}

export interface IAdminLoginDto {
  IDEmp: string;
  password: string;
}

// Backward-compatible aliases
export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface IUpdateProfileDto {
  fullname?: string;
  phone?: string;
  avatar?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IUpdateAccountSettingsDto {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
}
