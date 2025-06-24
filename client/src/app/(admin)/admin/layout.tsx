import { ToastContainer } from 'react-toastify';
import { QueryParamsProvider } from '@/hooks/QueryParamsContext';
import AuthProvider from '@/hooks/AuthProvider';
import { AdminBodyLayout } from '@/components/Layout/AdminBodyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Not found 404',
  description: 'Trang này không tồn tại',
  icons: [
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/laptop.png?v=2' },
    { rel: 'apple-touch-icon', url: '/laptop.png?v=2' },
  ],

};


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ToastContainer position='top-right'>
      </ToastContainer>
      <AuthProvider>
        <QueryParamsProvider>
          <AdminBodyLayout>{children}</AdminBodyLayout>
        </QueryParamsProvider>
      </AuthProvider>
    </>
  );
}
