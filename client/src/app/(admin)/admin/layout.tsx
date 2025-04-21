'use client'
import '@ant-design/v5-patch-for-react-19';
import { Geist, Geist_Mono } from "next/font/google";
import Header from "../../../../components/Header/Header";
import Footer from "../../../../components/Footer/Footer";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Sidebar } from "../../../../components/Sidebar/Sidebar";
import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '../../../../stores/store';
import {ToastContainer} from 'react-toastify';


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
        
        <Provider store={store}>
          <Header></Header>
          <div className="pt-20 grid grid-cols-12 grid-flow-row">
            <div className="col-span-2">
              <Sidebar></Sidebar>
            </div>
            <div className="col-span-10 pl-3">
              <div className="overflow-y-scroll max-h-[550px]">
                <AntdRegistry>{children}</AntdRegistry>
              </div>
              <Footer></Footer>
            </div>
          </div>

        </Provider>


      </body>
    </html>
  );
}
