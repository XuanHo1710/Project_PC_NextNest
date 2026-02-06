// ============== ACCOUNT EMPLOYEE ==============
// Based on: auth-service/account-employee/entities/account-employee.entity.ts

import type { IAddress } from "./account-guest";
import type { IRole } from "./role";

export interface IAccountEmployee {
  _id: string;
  IDEmp: string;
  password?: string;
  roleId: string;
  status: "ACTIVE" | "INACTIVE";
  avatar?: string;
  name: string;
  email: string;
  age?: number;
  gender: "MALE" | "FEMALE";
  addresses: IAddress[];
  createdBy?: { _id: string; email: string };
  updatedBy?: { _id: string; email: string };
  deletedBy?: { _id: string; email: string };
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  // Populated fields (when joined)
  role?: IRole;
}

// For admin auth context (sidebar, permissions)
export interface IAccountLogin {
  _id?: string;
  IDEmp: string;
  username: string;
  roleId: string;
  role?: IRole;
}
