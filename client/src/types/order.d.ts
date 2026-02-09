// ============== ORDER & CART ==============

import type { IProductCard, IProductVariant } from "./product";

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
  guestId: string;
  customerInfo: {
    fullname: string;
    phone: string;
    email: string;
    address: string;
    note: string;
  };
  orderDetail: ICartItem[];
  totalAmount: number;
  orderDate: Date;
  status?:
    | "PENDING"
    | "SHIPPING"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
}
