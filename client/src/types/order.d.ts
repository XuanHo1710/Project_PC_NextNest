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
  productVariant: {
    _id: string;
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

export interface IOrderDataCreate {
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
    | "REFUNDED";
}
