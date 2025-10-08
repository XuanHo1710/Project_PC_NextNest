'use client';

import React, { useEffect, ReactNode } from 'react';
import useCartStore from '@/hooks/useCart';
import { cartClientService } from '@/services/client/cart.client.service';
import useAuthUser from '@/hooks/useAuthUser';
import { ICart } from '@/types/model.client';
import { debounce } from '@/utils/debounce';

// type User = ILoginResponse['user'];


interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const { user } = useAuthUser();
    const { setCart } = useCartStore();
    useEffect(() => {
        const fetchCart = async () => {
            if (user === null) return;
            const cart = await cartClientService.getOne(user?.id || '');
            setCart(cart || {
                _id: '',
                cartItems: [],
                total: 0,
                guestId: user?.id || '',
            });
        };
        fetchCart();
    }, [user, setCart]);

    return <>{children}</>;
}


export const syncCartToServer = async (cart: ICart, userId: string | null) => {
    try {
        console.log("🔄 Syncing cart to server...");
        if (userId) {
            console.log(cart);
            const data = await cartClientService.updateCart(cart._id, cart);
            console.log(data);
            console.log("✅ Cart synced successfully");
        } else console.log("No user logged in, skipping cart sync.");
    } catch (err) {
        console.error("❌ Sync failed:", err);
    }
}

// ⚡ Dùng debounce để tránh gọi API liên tục
export const debouncedSync = debounce(syncCartToServer, 2000);
