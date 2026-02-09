import { create } from "zustand";
import { ICart, ICartItem } from "@/types/order";
import { IProductCard } from "@/types/product";
import { debouncedSync } from "@/providers/CartProviderClient";

interface CartVariant {
  _id: string;
  sku: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  combination: Record<string, string>;
}

interface CartState {
  cart: ICart | null;
  addToCart: (
    product: IProductCard,
    variant: CartVariant,
    quantity?: number,
  ) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  setCart: (cart: ICart) => void;
  calculateTotal: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: {
    _id: "",
    cartItems: [],
    total: 0,
    guestId: "",
  },

  addToCart: (product, variant, quantity = 1) => {
    const state = get();
    const existingItem = state.cart?.cartItems.find(
      (item) => item.variant._id === variant._id,
    );

    let updatedItems: ICartItem[] = [];
    const unitPrice = Math.round(variant.price * (1 - variant.discount / 100));

    if (existingItem) {
      updatedItems = state.cart!.cartItems.map((item) => {
        if (item.variant._id === variant._id) {
          const newQty = item.quantity + quantity;
          // Clamp to stock
          const clampedQty = Math.min(newQty, variant.stock);
          if (clampedQty <= 0) return item;
          return {
            ...item,
            quantity: clampedQty,
            subtotal: clampedQty * unitPrice,
          };
        }
        return item;
      });
    } else {
      if (variant.stock > 0) {
        const clampedQty = Math.min(quantity, variant.stock);
        const newItem: ICartItem = {
          product,
          variant: {
            _id: variant._id,
            sku: variant.sku,
            price: variant.price,
            discount: variant.discount,
            stock: variant.stock,
            images: variant.images,
            combination: variant.combination,
          },
          quantity: clampedQty,
          price: unitPrice,
          subtotal: unitPrice * clampedQty,
        };
        updatedItems = [...state.cart!.cartItems, newItem];
      } else {
        return; // Out of stock, don't add
      }
    }

    const updatedCart: ICart = {
      ...state.cart!,
      cartItems: updatedItems,
      total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    };

    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart!.guestId);
  },

  removeFromCart: (variantId) => {
    const state = get();
    const updatedItems = state.cart!.cartItems.filter(
      (item) => item.variant._id !== variantId,
    );

    const updatedCart: ICart = {
      ...state.cart!,
      cartItems: updatedItems,
      total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    };

    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart!.guestId);
  },

  updateQuantity: (variantId, delta) => {
    const state = get();
    const updatedItems = state
      .cart!.cartItems.map((item) => {
        if (item.variant._id === variantId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null; // Mark for removal
          const clampedQty = Math.min(newQty, item.variant.stock);
          return {
            ...item,
            quantity: clampedQty,
            subtotal: clampedQty * item.price,
          };
        }
        return item;
      })
      .filter(Boolean) as ICartItem[];

    const updatedCart: ICart = {
      ...state.cart!,
      cartItems: updatedItems,
      total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    };

    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart!.guestId);
  },

  clearCart: () => {
    const state = get();
    const cleared: ICart = {
      _id: state.cart?._id || "",
      cartItems: [],
      total: 0,
      guestId: state.cart?.guestId || "",
    };
    set({ cart: cleared });
    debouncedSync(cleared, cleared.guestId);
  },

  setCart: (cart) => set({ cart }),

  calculateTotal: () => {
    const state = get();
    return state.cart?.cartItems.reduce((sum, i) => sum + i.subtotal, 0) || 0;
  },
}));

// Đọc localStorage sau khi client render
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("cart");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      useCartStore.setState({ cart: parsed });
    } catch {
      localStorage.removeItem("cart");
    }
  }
}

export default useCartStore;
