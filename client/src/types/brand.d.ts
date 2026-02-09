// ============== BRAND ==============
// Based on: product-service/brand/entities/brand.entity.ts

export interface IBrand {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}
