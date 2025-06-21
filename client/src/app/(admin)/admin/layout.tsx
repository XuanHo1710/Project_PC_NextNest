'use client'
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import { QueryParamsProvider } from '@/hooks/QueryParamsContext';
import Header from '@/components/Header/Header';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import Footer from '@/components/Footer/Footer';
import SlideRefreshToken from '@/hooks/SideRefreshToken';
import AuthProvider from '@/hooks/AuthProvider';



export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [collapsed, setCollapsed] = useState(false);


  return (
    <>
      <ToastContainer position='top-right'>
      </ToastContainer>
      <AuthProvider>
        <QueryParamsProvider>
          <Header collapsed={collapsed} setCollapsed={setCollapsed}></Header>
          <div className="pt-20 flex overflow-y-hidden h-screen">
            <Sidebar collapsed={collapsed} ></Sidebar>
            <div className="overflow-y-scroll grow bg-slate-50" style={{ scrollbarWidth: "none" }}>
              <div className='px-5'>
                {children}
                <SlideRefreshToken />
              </div>
              <Footer></Footer>
            </div>
          </div>
        </QueryParamsProvider>
      </AuthProvider>
    </>
  );
}
