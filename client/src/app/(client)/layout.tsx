'use client'

import FooterClient from "@/components/client/Layout/Footer";
import HeaderClient from "@/components/client/Layout/Header";
import { ChatBot } from "@/components/Chat";
import ScrollToTop from "@/components/common/ScrollToTop";


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProviderClient';
import { CartProvider } from "@/providers/CartProviderClient";

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const queryClient = new QueryClient();

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {/* <GlobalLoading> */}
                    <CartProvider>
                        <ScrollToTop />
                        <HeaderClient />
                        <div className="mt-20 sm:mt-24 md:mt-28">
                            {children}
                        </div>
                        <FooterClient />
                        {/* Chat và Social Icons */}
                        <ChatBot />
                    </CartProvider>
                    {/* </GlobalLoading> */}
                </AuthProvider>
            </QueryClientProvider>
        </>
    );
}
