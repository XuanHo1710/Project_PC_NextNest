import { create } from 'zustand';
import { ICart, ICartItem, IProductCard } from '@/types/model.client';
import { debouncedSync } from '@/providers/CartProviderClient';


interface CartState {
    cart: ICart | null;
    addToCart: (product: IProductCard, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setCart: (cart: ICart) => void;
    calculateTotal: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
    cart: {
        _id: '',
        cartItems: [],
        total: 0,
        guestId: '',
    },

    addToCart: (product, quantity = 1) => {
        const state = get();
        const existingItem = state.cart?.cartItems.find(
            (item) => item.product._id === product._id
        );

        let updatedItems: ICartItem[] = [];

        if (existingItem) {
            updatedItems = state.cart!.cartItems.map((item) =>
                item.product._id === product._id
                    ? {
                        ...item,
                        quantity: item.quantity + quantity,
                        subtotal: (item.quantity + quantity) * item.price,
                    }
                    : item
            );
        } else {
            const newItem: ICartItem = {
                product,
                quantity,
                price: product.newPrice,
                subtotal: product.newPrice * quantity,
            };
            updatedItems = [...state.cart!.cartItems, newItem];
        }

        const updatedCart: ICart = {
            ...state.cart!,
            cartItems: updatedItems,
            total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
            _id: state.cart!._id || "1" // Default id cho cart khi thêm sp vào (sẽ được server cấp sau)
        };

        set({ cart: updatedCart });
        debouncedSync(updatedCart, state.cart!.guestId); // ⚡ gọi API sau khi user ngừng thao tác 0.5s
    },

    removeFromCart: (productId) => {
        const state = get();
        const updatedItems = state.cart!.cartItems.filter(
            (item) => item.product._id !== productId
        );

        const updatedCart: ICart = {
            ...state.cart!,
            cartItems: updatedItems,
            total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
        };

        set({ cart: updatedCart });
        debouncedSync(updatedCart, state.cart!.guestId); // ⚡ gọi API sau khi user ngừng thao tác 0.5s
    },

    updateQuantity: (productId, qty) => {
        const state = get();
        const updatedItems = state.cart!.cartItems
            .map((item) =>
                item.product._id === productId
                    ? {
                        ...item,
                        quantity: item.quantity + qty,
                        subtotal: (item.quantity + qty) * item.price,
                    }
                    : item
            )
            .filter((item) => item.quantity > 0);

        const updatedCart: ICart = {
            ...state.cart!,
            cartItems: updatedItems,
            total: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
        };

        set({ cart: updatedCart });
        debouncedSync(updatedCart, state.cart!.guestId); // ⚡ gọi API sau khi user ngừng thao tác 0.5s
    },

    clearCart: () => {
        const cleared: ICart = { _id: '', cartItems: [], total: 0, guestId: '' };
        set({ cart: cleared });
        debouncedSync(cleared, cleared.guestId); // ⚡
    },

    setCart: (cart) => set({ cart }),

    calculateTotal: () => {
        const state = get();
        return state.cart?.cartItems.reduce((sum, i) => sum + i.subtotal, 0) || 0;
    },
}));

export default useCartStore;
