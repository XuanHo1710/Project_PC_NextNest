import { create } from "zustand";
import { ICart, ICartItem } from "@/types/order";
import { IProductCard } from "@/types/product";
import { debouncedSync } from "@/providers/CartProviderClient";

/**
 * Variant info needed to add to cart.
 * Each unique variant._id = 1 separate cart line item.
 * Only the SAME variant._id increases quantity.
 */
export interface CartVariant {
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

/** Calculate unit price after discount */
const calcUnitPrice = (price: number, discount: number) =>
  Math.round(price * (1 - discount / 100));

/** Recalculate cart total from items */
const calcTotal = (items: ICartItem[]) =>
  items.reduce((sum, i) => sum + i.subtotal, 0);

const useCartStore = create<CartState>((set, get) => ({
  cart: { _id: "", cartItems: [], total: 0, guestId: "" },

  /**
   * Add product+variant to cart.
   * KEY RULE: Each variant._id is a SEPARATE line item.
   * - Same variant._id → increase quantity (capped at stock)
   * - Different variant._id (even same product) → new line item
   */
  addToCart: (product, variant, quantity = 1) => {
    const state = get();
    if (!state.cart || !variant._id) return;

    const unitPrice = calcUnitPrice(variant.price, variant.discount);

    // Find existing item by VARIANT ID (not product ID)
    const existIdx = state.cart.cartItems.findIndex(
      (item) => item.variant._id === variant._id,
    );

    let updatedItems: ICartItem[];

    if (existIdx >= 0) {
      // Same variant exists → increase quantity
      updatedItems = state.cart.cartItems.map((item, idx) => {
        if (idx !== existIdx) return item;
        const newQty = Math.min(item.quantity + quantity, variant.stock);
        if (newQty <= 0) return item;
        return { ...item, quantity: newQty, subtotal: newQty * unitPrice };
      });
    } else {
      // New variant → create new line item
      if (variant.stock <= 0) return;
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
      updatedItems = [...state.cart.cartItems, newItem];
    }

    const updatedCart: ICart = {
      ...state.cart,
      cartItems: updatedItems,
      total: calcTotal(updatedItems),
    };
    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart.guestId);
  },

  /** Remove a cart line item by its variant._id */
  removeFromCart: (variantId) => {
    const state = get();
    if (!state.cart) return;

    const updatedItems = state.cart.cartItems.filter(
      (item) => item.variant._id !== variantId,
    );
    const updatedCart: ICart = {
      ...state.cart,
      cartItems: updatedItems,
      total: calcTotal(updatedItems),
    };
    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart.guestId);
  },

  /** Update quantity for a specific variant. delta < 0 to decrease, > 0 to increase. */
  updateQuantity: (variantId, delta) => {
    const state = get();
    if (!state.cart) return;

    const updatedItems = state.cart.cartItems
      .map((item) => {
        if (item.variant._id !== variantId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null; // Remove item
        const clampedQty = Math.min(newQty, item.variant.stock);
        return {
          ...item,
          quantity: clampedQty,
          subtotal: clampedQty * item.price,
        };
      })
      .filter(Boolean) as ICartItem[];

    const updatedCart: ICart = {
      ...state.cart,
      cartItems: updatedItems,
      total: calcTotal(updatedItems),
    };
    set({ cart: updatedCart });
    debouncedSync(updatedCart, state.cart.guestId);
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
    return calcTotal(state.cart?.cartItems || []);
  },
}));

// Hydrate from localStorage on client
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
