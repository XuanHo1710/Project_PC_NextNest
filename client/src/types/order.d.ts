// ============== ORDER & CART ==============

import type {
  IProductCard,
  IProductVariant,
  IProductVariantPopulated,
} from "./product";

export interface ICartItem {
  product: IProductCard; // Product info for display (name, slug, brand, category)
  variant: {
    _id: string;
    sku: string;
    price: number;
    discount: number;
    stock: number;
    images: string[];
    combination: Record<string, string>;
  };
  quantity: number;
  subtotal: number;
  price: number; // Unit price after discount
}

export interface ICartItemOrder {
  product: IProductCard; // Product info for display (name, slug, brand, category)
  productVariant: {
    _id: string;
    sku: string;
    price: number;
    discount: number;
    stock: number;
    images: string[];
    combination: Record<string, string>;
  };
  quantity: number;
  subtotal: number;
  price: number; // Unit price after discount
}

export interface ICart {
  _id: string;
  cartItems: ICartItem[];
  total: number;
  guestId: string;
}

// Server cart item shape (what backend returns after populate)
export interface IServerCartItem {
  product: IProductVariant & { product?: IProductCard };
  quantity: number;
  subtotal: number;
  price: number;
}

export interface IOrderData {
  _id?: string;
  customerInfo: {
    guestId: string;
    fullname: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  };
  orderDetail: ICartItemOrder[];
  totalAmount: number;
  status?:
    | "PENDING"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED";
  payment?: {
    isCheckout: boolean;
    type: string;
  };
}

// Order detail item as returned from API (snapshot — no ObjectId ref)
export interface IOrderDetailItem {
  variantId: string;
  sku: string;
  variantPrice: number;
  discount: number;
  images: string[];
  combination: Record<string, string>;
  productName: string;
  quantity: number;
  subtotal: number;
  price: number;
}

// Full order as returned from API
export interface IOrder {
  _id: string;
  customerInfo: {
    guestId: string;
    fullname: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  };
  orderDetail: IOrderDetailItem[];
  totalAmount: number;
  status:
    | "PENDING"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED"
    | "EXPIRED"
    | "PENDING_REJECTION";
  orderDate: string;
  expireAt?: string;
  payment: {
    isCheckout: boolean;
    type: string;
  };
  reason?: string;
  createdAt: string;
  updatedAt: string;
}
