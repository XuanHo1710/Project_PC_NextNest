// ============== ROLE ==============
// Based on: auth-service/role/entities/role.entity.ts

export interface IPermission {
  method: string;
  path: string;
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  permission: IPermission[];
  createdBy?: { _id: string; email: string };
  updatedBy?: { _id: string; email: string };
  deletedBy?: { _id: string; email: string };
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}
