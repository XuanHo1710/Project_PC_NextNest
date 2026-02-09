'use client'
import Link from 'next/link';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { BellOutlined, CheckOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button } from "antd";

import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { pathAdminRoutes } from '@/config/route';
import { useRouter } from 'next/navigation';


export default function Header({ setCollapsed, collapsed }: { setCollapsed: (collapsed: boolean) => void, collapsed: boolean }) {
  const [displayNotify, setDisplayNotify] = useState(false);
  const { accountLogin, resetAuth } = useAuthEmployee();
  const router = useRouter();
  const handleLogout = async () => {
    await axios.post(`/api/admin/auth/logout`, {})
      .then(() => {
        resetAuth();
      }).catch(error => {
        toast.error(error);
      }).finally(() => {
        router.push(pathAdminRoutes.login);
      })
  }
  return (
    <>
      <header className="fixed top-0 bg-white z-50 left-0 right-0 py-5 px-5 border-b-2 border-slate-100 border-solid">
        <div className="flex justify-between text-center">
          <div className='flex items-center justify-between px-2'>
            <h2 className='italic font-semibold text-lg'>
              {collapsed ? "" : "Hoang Ha PC"}
            </h2>
            <Button variant='outlined' color='blue' onClick={() => setCollapsed(!collapsed)} className={collapsed ? "ml-2" : "ml-15"}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
          </div>
          <div className="flex justify-center gap-3 items-center">
            <div className='relative cursor-pointer'>
              <BellOutlined className='text-2xl' onClick={() => setDisplayNotify(!displayNotify)} />
              <span className='absolute -top-2 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center'>3</span>
              <div className={`absolute top-10 cursor-default z-10 right-0 ${displayNotify ? "block" : "hidden"}`}>
                <div className='bg-white shadow-lg rounded-md w-96'>
                  <div className='flex items-center justify-between border-b-2 border-gray-100 px-4 py-5'>
                    <h4 className='font-semibold text-sm'>Thông báo</h4>
                    <CheckOutlined className='rounded-full border-2 p-0.5 !text-green-500 border-green-500' />
                  </div>
                  <ul className='max-h-60 overflow-y-auto cursor-pointer'>
                    <li className='py-3 border-b flex justify-between gap-2 px-4 hover:bg-slate-50 border-gray-200'>
                      <div className='text-left'>
                        <h2 className='text-sm line-clamp-1'>Your Profile is Complete 60%</h2>
                        <p className='text-xs mt-1 text-gray-500'>20 min ago</p>
                      </div>
                      <div className='text-sm'>3:00 AM</div>
                    </li>
                    <li className='py-3 border-b flex justify-between gap-2 px-4 hover:bg-slate-50 border-gray-200'>
                      <div className='text-left'>
                        <h2 className='text-sm line-clamp-1'>Your Profile is Complete 60%</h2>
                        <p className='text-xs mt-1 text-gray-500'>20 min ago</p>
                      </div>
                      <div className='text-sm'>3:00 AM</div>
                    </li>
                    <li className='py-3 border-b flex justify-between gap-2 px-4 hover:bg-slate-50 border-gray-200'>
                      <div className='text-left'>
                        <h2 className='text-sm line-clamp-1'>Your Profile is Complete 60%</h2>
                        <p className='text-xs mt-1 text-gray-500'>20 min ago</p>
                      </div>
                      <div className='text-sm'>3:00 AM</div>
                    </li>


                  </ul>
                  <div className='py-5 cursor-pointer font-semibold text-blue-500'>View All</div>
                </div>
              </div>
            </div>
            <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer hover:text-blue-500 text-black">
              {accountLogin?.avatar ? (
                <Avatar
                  src={accountLogin.avatar}
                  alt={`${accountLogin.username ? accountLogin.username : 'User Avatar'}`}
                />
              ) : (
                <UserOutlined className="rounded-full border-2 p-1" />
              )}
              <h3 className='text-sm font-semibold'>{accountLogin?.username}</h3>
            </Link>
            <Button onClick={handleLogout} variant='outlined' color='red' className="mx-2">Đăng xuất</Button>
          </div>
        </div>
      </header>
    </>
  );
}
