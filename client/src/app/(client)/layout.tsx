
// import { Metadata } from 'next';

import FooterClient from "@/components/client/Layout/Footer";
import HeaderClient from "@/components/client/Layout/Header";

// export const metadata: Metadata = {
//   title: 'Not found 404',
//   description: 'Trang này không tồn tại',
//   icons: [
//     { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/laptop.png?v=2' },
//     { rel: 'apple-touch-icon', url: '/laptop.png?v=2' },
//   ],
// };


export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <HeaderClient />
            <div className="mt-28">
                {children}

            </div>
            <FooterClient />
        </>
    );
}
