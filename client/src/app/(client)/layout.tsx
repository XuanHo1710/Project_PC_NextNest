'use client'
// import { Metadata } from 'next';

import FooterClient from "@/components/client/Layout/Footer";
import HeaderClient from "@/components/client/Layout/Header";
import GlobalLoading from "@/components/GlobalLoading/GlobalLoading";

// export const metadata: Metadata = {
//   title: 'Not found 404',
//   description: 'Trang này không tồn tại',
//   icons: [
//     { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/laptop.png?v=2' },
//     { rel: 'apple-touch-icon', url: '/laptop.png?v=2' },
//   ],
// };

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const queryClient = new QueryClient();

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <GlobalLoading>
                    <HeaderClient />
                    <div className="mt-28">
                        {children}

                    </div>
                    <FooterClient />
                </GlobalLoading>
            </QueryClientProvider>
        </>
    );
}
