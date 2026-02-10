// ============== PRODUCT SERVICE TYPES ==============
// Based on: product-service entities

import type { IBrand } from "./brand";
import type { ICategory } from "./category";

// ============== PRODUCT ATTRIBUTE ==============
export interface IProductAttribute {
  _id: string;
  name: string;
  code?: string;
  displayType: "COLOR" | "IMAGE" | "BUTTON" | "RADIO";
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============== PRODUCT ATTRIBUTE VALUE ==============
export interface IProductAttributeValue {
  _id: string;
  value: string;
  label: string;
  attribute: string | IProductAttribute;
  colorHex?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============== PRODUCT ATTRIBUTE ALLOW VALUE ==============
export interface IProductAttributeAllowValue {
  _id: string;
  product: string;
  attributeValue: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============== PRODUCT VARIANT ==============
export interface IProductVariant {
  _id: string;
  sku: string;
  subDescription?: string;
  product: string;
  price: number;
  stock: number;
  discount: number; // 0 -> 100%
  combination: Record<string, string>;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============== PRODUCT (Main Entity) ==============
export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  category?: string;
  minPrice: number;
  maxPrice: number;
  status: "ACTIVE" | "INACTIVE" | "STOPSOLD";
  defaultProductVariantId?: string;
  totalRatings?: number;
  avgRating?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;

  // For created product response
  brandId?: string;
  categoryId?: string;
}

// ============== PRODUCT POPULATED ==============
export interface IProductPopulated {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: IBrand;
  category?: ICategory;
  minPrice: number;
  maxPrice: number;
  status: "ACTIVE" | "INACTIVE" | "STOPSOLD";
  defaultProductVariantId?: IProductVariant;
  variants?: IProductVariant[];
  totalRatings?: number;
  avgRating?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

// ============== PRODUCT CARD (For list/grid display) ==============
export interface IProductCard {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "ACTIVE" | "INACTIVE" | "STOPSOLD";
  defaultVariant?: {
    _id: string;
    sku: string;
    price: number;
    discount: number;
    images: string[];
    combination: Record<string, string>;
    stock?: number;
  };
  brand?: { _id: string; name: string; logo?: string };
  category?: { _id: string; name: string; slug: string };
  avgRating?: number;
  totalRatings?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============== PAGINATION ==============
import type { PaginatedResponse } from "./index";

/** @deprecated Use PaginatedResponse<IProductCard> instead */
export type IProductListResponse = PaginatedResponse<IProductCard>;

/** @deprecated Use PaginatedResponse<IProductCard> instead */
export type IProductWithPagination = PaginatedResponse<IProductCard>;

export interface IProductDetailResponse {
  data: IProductPopulated;
}

// ============== DTOs ==============
export interface ICreateProductDto {
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: "ACTIVE" | "INACTIVE";
  defaultProductVariantId?: string;
}

export interface IUpdateProductDto extends Partial<ICreateProductDto> {}

export interface ICreateProductVariantDto {
  sku: string;
  subDescription?: string;
  product: string;
  price: number;
  stock?: number;
  discount?: number;
  combination?: Record<string, string>;
  images?: string[];
}
