'use client'
import '@ant-design/v5-patch-for-react-19';
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import { QueryParamsProvider } from '@/hooks/QueryParamsContext';
import Header from '@/components/Header/Header';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import Footer from '@/components/Footer/Footer';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Không render layout nếu trang là "/auth-login"
  if (pathname === "/admin/auth/login") {
    return <>{children}</>;
  }



  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer position='top-right'></ToastContainer>
        <QueryParamsProvider>
          <Header collapsed={collapsed} setCollapsed={setCollapsed}></Header>
          <div className="pt-20 flex overflow-y-hidden h-screen">
            <Sidebar collapsed={collapsed} ></Sidebar>
            <div className="overflow-y-scroll grow bg-slate-50" style={{ scrollbarWidth: "none" }}>
              <div className='px-5'>
                <AntdRegistry>{children}</AntdRegistry>
              </div>
              <Footer></Footer>
            </div>
          </div>
        </QueryParamsProvider>
      </body>
    </html>
  );
}
