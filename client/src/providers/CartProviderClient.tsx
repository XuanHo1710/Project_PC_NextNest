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

export function CartProvider({ children }: CartProviderProps) {
    const { user } = useAuthUser();
    const { setCart } = useCartStore();

    useEffect(() => {
        const initializeCart = async () => {
            if (user === null) return;

            const guestId = user.id;

            // 1. Fetch server cart
            const serverCart = await cartClientService.getOne(guestId);

            // 2. Check for localStorage cart
            const localStorageCart = localStorage.getItem('cart');

            if (localStorageCart) {
                try {
                    const localCart: ICart = JSON.parse(localStorageCart);

                    // Merge server cart items + local cart items
                    const mergedItems: ICartItem[] = serverCart?.cartItems ? [...serverCart.cartItems] : [];

                    localCart.cartItems.forEach(localItem => {
                        if (!localItem.variant?._id) return;

                        const existIndex = mergedItems.findIndex(
                            item => item.variant._id === localItem.variant._id
                        );

                        if (existIndex >= 0) {
                            // Item exists: combine quantities (capped at stock)
                            const existing = mergedItems[existIndex];
                            const newQty = existing.quantity + localItem.quantity;
                            const maxStock = existing.variant.stock;
                            existing.quantity = Math.min(newQty, maxStock);
                            existing.subtotal = existing.quantity * existing.price;
                        } else {
                            // New item: add it
                            mergedItems.push(localItem);
                        }
                    });

                    // 3. Create merged cart object
                    const finalCart: ICart = {
                        _id: serverCart?._id || '',
                        cartItems: mergedItems,
                        total: mergedItems.reduce((sum, item) => sum + item.subtotal, 0),
                        guestId,
                    };

                    // 4. Sync merged cart to server (upsert by guestId)
                    const returnedId = await cartClientService.updateCart(finalCart);
                    if (returnedId) {
                        finalCart._id = returnedId;
                    }

                    // 5. Update store and cleanup
                    setCart(finalCart);
                    localStorage.removeItem('cart');
                } catch (error) {
                    console.error('Cart merge failed:', error);
                    localStorage.removeItem('cart');
                    // Fallback: set server cart
                    setCart(serverCart || { _id: '', cartItems: [], total: 0, guestId });
                }
            } else {
                // No localStorage: just set server cart
                setCart(serverCart || {
                    _id: '',
                    cartItems: [],
                    total: 0,
                    guestId,
                });
            }
        };

        initializeCart();
    }, [user, setCart]);

    return <>{children}</>;
}


/**
 * Sync cart to server or localStorage depending on login state
 */
export const syncCartToServer = async (cart: ICart, userId: string | null) => {
    try {
        if (userId && cart.guestId) {
            // User is logged in: sync to server (upsert by guestId)
            const returnedId = await cartClientService.updateCart(cart);

            // Update cart._id in store if it was updated on server
            if (returnedId && cart._id !== returnedId) {
                const currentCart = useCartStore.getState().cart;
                if (currentCart) {
                    useCartStore.setState({
                        cart: { ...currentCart, _id: returnedId },
                    });
                }
            }
        } else {
            // User is not logged in: save to localStorage only
            if (cart && cart.cartItems.length > 0) {
                localStorage.setItem('cart', JSON.stringify(cart));
            }
        }
    } catch (error) {
        console.error('Cart sync error:', error);
    }
};

/**
 * Debounce cart sync to avoid excessive API calls
 */
export const debouncedSync = debounce(syncCartToServer, 2000);
