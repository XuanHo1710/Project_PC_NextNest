'use client';

import React, { useEffect, ReactNode } from 'react';
import useCartStore from '@/hooks/useCart';
import { cartClientService } from '@/services/client/cart.client.service';
import useAuthUser from '@/hooks/useAuthUser';
import { ICart, ICartItem } from '@/types/order';
import { debounce } from '@/utils/debounce';

interface CartProviderProps {
    children: ReactNode;
}

/**
 * Merge two sets of cart items by variant._id.
 * Same variant → combine quantities (capped at stock).
 * Different variant → separate line items.
 */
function mergeCartItems(base: ICartItem[], incoming: ICartItem[]): ICartItem[] {
    const map = new Map<string, ICartItem>();

    // Add base items first
    for (const item of base) {
        if (!item.variant?._id) continue;
        map.set(item.variant._id, { ...item });
    }

    // Merge incoming items
    for (const item of incoming) {
        if (!item.variant?._id) continue;
        const existing = map.get(item.variant._id);
        if (existing) {
            const maxStock = Math.max(existing.variant.stock, item.variant.stock);
            const mergedQty = Math.min(existing.quantity + item.quantity, maxStock);
            existing.quantity = mergedQty;
            existing.subtotal = mergedQty * existing.price;
        } else {
            map.set(item.variant._id, { ...item });
        }
    }

    return Array.from(map.values());
}

export function CartProvider({ children }: CartProviderProps) {
    const { user } = useAuthUser();
    const { setCart } = useCartStore();

    useEffect(() => {
        const initializeCart = async () => {
            if (user === null) return;
            const guestId = user.id;

            // 1. Fetch server cart
            const serverCart = await cartClientService.getOne(guestId);

            // 2. Check for localStorage cart (anonymous session → now logged in)
            const localStorageCart = localStorage.getItem('cart');

            if (localStorageCart) {
                try {
                    const localCart: ICart = JSON.parse(localStorageCart);

                    // Merge: server items + local items, keyed by variant._id
                    const mergedItems = mergeCartItems(
                        serverCart?.cartItems || [],
                        localCart.cartItems || [],
                    );

                    const finalCart: ICart = {
                        _id: serverCart?._id || '',
                        cartItems: mergedItems,
                        total: mergedItems.reduce((sum, i) => sum + i.subtotal, 0),
                        guestId,
                    };

                    // Sync merged cart to server
                    const returnedId = await cartClientService.updateCart(finalCart);
                    if (returnedId) finalCart._id = returnedId;

                    setCart(finalCart);
                    localStorage.removeItem('cart');
                } catch (error) {
                    console.error('Cart merge failed:', error);
                    localStorage.removeItem('cart');
                    setCart(serverCart || { _id: '', cartItems: [], total: 0, guestId });
                }
            } else {
                // No localStorage: just set server cart
                setCart(serverCart || { _id: '', cartItems: [], total: 0, guestId });
            }
        };

        initializeCart();
    }, [user, setCart]);

    return <>{children}</>;
}


/**
 * Sync cart to server (logged in) or localStorage (anonymous).
 */
export const syncCartToServer = async (cart: ICart, userId: string | null) => {
    try {
        if (userId && cart.guestId) {
            const returnedId = await cartClientService.updateCart(cart);

            // Update cart._id in store if server assigned a new one
            if (returnedId && cart._id !== returnedId) {
                const currentCart = useCartStore.getState().cart;
                if (currentCart) {
                    useCartStore.setState({
                        cart: { ...currentCart, _id: returnedId },
                    });
                }
            }
        } else {
            // Not logged in: save to localStorage
            if (cart && cart.cartItems.length > 0) {
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        }
    } catch (error) {
        console.error('Cart sync error:', error);
    }
};

/**
 * Debounce cart sync (2s) to avoid excessive API calls on rapid quantity changes.
 */
export const debouncedSync = debounce(syncCartToServer, 2000);
