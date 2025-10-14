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
            const cartFromLocalStorage = localStorage.getItem('cart');
            if (cartFromLocalStorage) {
                const localCart: ICart = JSON.parse(cartFromLocalStorage);
                // Gộp cart từ localStorage với cart hiện tại. Xu ly ca quantity neu trung san pham
                const mergedItems = cart ? [...cart.cartItems] : [];
                localCart.cartItems.forEach(localItem => {
                    const existingItem = mergedItems.find(item => item.product._id === localItem.product._id);
                    if (existingItem) {
                        if (existingItem.quantity + localItem.quantity > localItem.product.stock) {
                            existingItem.quantity = localItem.product.stock; // Giới hạn không vượt quá stock
                        } else {
                            existingItem.quantity += localItem.quantity;
                        }
                        existingItem.subtotal = existingItem.quantity * existingItem.price;
                    } else {
                        mergedItems.push(localItem);
                    }
                });
                const mergedCart: ICart = {
                    ...localCart,
                    cartItems: mergedItems,
                    _id: cart ? cart._id : "1", // Default id cho cart khi thêm sp vào (sẽ được server cấp sau)
                    guestId: user?.id || '',
                };
                mergedCart.total = mergedCart.cartItems.reduce((sum, i) => sum + i.subtotal, 0);
                await cartClientService.updateCart(mergedCart._id, mergedCart);
                setCart(mergedCart);
                localStorage.removeItem('cart');
                console.log("✅ Cart merged successfully");
                return;
            }
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
        if (userId) {
            await cartClientService.updateCart(cart._id, cart);

            console.log("✅ Cart synced successfully");
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log("✅ Cart saved to localStorage");
        }
    } catch (err) {
        console.error("❌ Sync failed:", err);
    }
}

// ⚡ Dùng debounce để tránh gọi API liên tục
export const debouncedSync = debounce(syncCartToServer, 2000);
