// ============== ORDER & CART ==============

import type { IProductCard } from "./product";

export interface ICartItem {
  product: IProductCard;
  variant?: {
    _id: string;
    sku: string;
    price: number;
    discount: number;
    images: string[];
    combination: Record<string, string>;
  };
  quantity: number;
  subtotal: number;
  price: number;
}

export interface ICart {
  _id: string;
  cartItems: ICartItem[];
  total: number;
  guestId: string;
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
