'use client';

import Link from 'next/link';
import { Image } from 'antd';
import { IClientUser } from '@/types/auth';

interface ProfileSidebarProps {
    user: IClientUser | null;
    activePage: 'detail' | 'order' | 'pending-payment' | 'wishlist' | 'address' | 'password';
}

const menuItems = [
    { key: 'detail', href: '/profile/detail', icon: 'fa-regular fa-user', label: 'Thông tin tài khoản' },
    { key: 'order', href: '/profile/order', icon: 'far fa-list-alt', label: 'Tra cứu đơn hàng' },
    { key: 'pending-payment', href: '/profile/pending-payment', icon: 'fa-solid fa-credit-card', label: 'Đơn chờ thanh toán' },
    { key: 'wishlist', href: '/profile/wishlist', icon: 'fa-solid fa-heart', label: 'Danh sách yêu thích' },
    { key: 'address', href: '/profile/address', icon: 'fa-solid fa-location-dot', label: 'Quản lý địa chỉ' },
    { key: 'password', href: '/profile/password', icon: 'fas fa-lock', label: 'Thay đổi mật khẩu' },
];

export default function ProfileSidebar({ user, activePage }: ProfileSidebarProps) {
    return (
        <div className='col-span-12 lg:col-span-3'>
            <div className='flex items-center'>
                {user && user?.avatar ? (
                    <Image src={user.avatar} alt="User Avatar" width={40} height={40} className="rounded-full" preview={false} />
                ) : (
                    <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                )}
                <div className='mx-4'>
                    <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                    <h1 className='font-bold text-lg'>{user?.fullname || 'Khách hàng'}</h1>
                </div>
            </div>
            <ul className='pl-0 my-5'>
                {menuItems.map((item) => (
                    <Link
                        key={item.key}
                        className={`font-medium block my-3 py-3 px-5 rounded-lg ${activePage === item.key
                            ? 'bg-blue-400 text-white'
                            : 'hover:bg-blue-400 hover:text-white bg-stone-100 text-stone-600'
                            }`}
                        href={item.href}
                    >
                        <li className='inline-block'>
                            <i className={`${item.icon} w-9`}></i>
                            <span className='font-medium'>{item.label}</span>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
}
