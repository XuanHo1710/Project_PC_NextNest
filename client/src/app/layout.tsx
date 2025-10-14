
import '@/utils/suppressAntdWarnings.early';
import '@ant-design/v5-patch-for-react-19';
import '@/utils/suppressAntdWarnings';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ToastContainer } from 'react-toastify';
import { QueryProvider } from '@/providers/QueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PC Store - Mua sắm PC Gaming, Laptop, Linh kiện chính hãng",
  description: "Chuyên cung cấp PC Gaming, Laptop, Linh kiện máy tính chính hãng với giá tốt nhất. Bảo hành uy tín, giao hàng toàn quốc, trả góp 0%.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "PC Store - Siêu thị PC & Laptop Gaming chính hãng",
    description: "Hệ thống bán lẻ PC, Laptop, linh kiện chính hãng uy tín với giá tốt nhất",
    images: ['/logo.jpg'],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PC Store - Siêu thị PC & Laptop Gaming",
    description: "Chuyên cung cấp PC Gaming, Laptop, Linh kiện chính hãng",
    images: ['/logo.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />

        <ToastContainer position='top-right'></ToastContainer>
        <QueryProvider>
          <AntdRegistry>{children}</AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
