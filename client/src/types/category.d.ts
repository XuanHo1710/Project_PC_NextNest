// ============== CATEGORY ==============
// Based on: product-service/category/entities/category.entity.ts

export interface ICategory {
  _id: string;
  name: string;
  parentId?: string | { _id: string; name: string } | null; // Can be populated
  slug: string;
  children?: ICategory[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// For client-side category preview with products
export interface ICategoryPreview {
  _id: string;
  name: string;
  slug?: string;
  products: import("./product").IProductCard[];
}
