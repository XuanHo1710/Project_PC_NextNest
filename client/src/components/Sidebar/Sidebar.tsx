'use client'
import React from 'react';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { FaHome, FaUserFriends } from 'react-icons/fa';
import { MdManageAccounts } from 'react-icons/md';
import { IoIosPeople, IoIosSettings } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { GiLaptop } from 'react-icons/gi';
import { BiCategory } from 'react-icons/bi';
import { SiAdguard } from 'react-icons/si';
import { FaPeopleGroup } from 'react-icons/fa6';
import { GoLaw } from 'react-icons/go';
import Link from 'next/link';
import { MoneyCollectOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { pathAdminRoutes } from '@/config/route';


type MenuItem = Required<MenuProps>['items'][number];

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const { accountLogin } = useAuthEmployee();



    const items: MenuItem[] = [
        {
            key: 'home',
            type: 'group',
            label: 'MENU',
            children: [
                {
                    key: 'dashboard',
                    label: <Link href={pathAdminRoutes.dashboard}>Dashboard</Link>,
                    icon: <FaHome />
                },
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/product"
                ) ? {
                    key: 'products',
                    label: <Link href={pathAdminRoutes.products}>Sản phẩm</Link>,
                    icon: <GiLaptop />
                } : null,
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/category"
                ) ? {
                    key: 'category',
                    label: <Link href={pathAdminRoutes.category}>Danh mục sản phẩm</Link>,
                    icon: <BiCategory />
                } : null,
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/discount"
                ) ? {
                    key: 'discount',
                    label: <Link href={pathAdminRoutes.discount}>Khuyến mãi</Link>,
                    icon: <MoneyCollectOutlined />
                } : null,
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/order"
                ) ? {
                    key: 'order',
                    label: 'Đơn hàng',
                    icon: <ShoppingCartOutlined />
                } : null,
            ],
        },
        {
            type: 'divider',
        },
        {
            key: 'security',
            label: 'SECURITY',
            type: 'group',
            children: [
                {
                    key: 'user',
                    label: 'Người dùng',
                    icon: <FaUserFriends />,
                    children: [
                        accountLogin && accountLogin.role && accountLogin.role.permission.some(
                            (p) => p.method === "GET" && p.path === "/api/v1/admin/employee"
                        ) ? {
                            key: 'employee',
                            label: <Link href={pathAdminRoutes.employee}>Thông tin nhân viên</Link>,
                            icon: <IoIosPeople />
                        } : null,
                        {
                            key: 'customer',
                            label: <Link href={pathAdminRoutes.guest}>Thông tin khách hàng</Link>,
                            icon: <FaPeopleGroup />

                        },
                    ],
                },
                {
                    key: 'account',
                    label: 'Tài khoản',
                    icon: <MdManageAccounts />,
                    children: [
                        accountLogin && accountLogin.role && accountLogin.role.permission.some(
                            (p) => p.method === "GET" && p.path === "/api/v1/admin/account-employee"
                        ) ? {
                            key: 'employeeAccount',
                            label: <Link href={pathAdminRoutes.accountEmployee}>Tài khoản nhân viên</Link>,
                            icon: <IoIosPeople />
                        } : null,
                        {
                            key: 'customerAccount',
                            label: <Link href={pathAdminRoutes.accountGuest}>Tài khoản khách hàng</Link>,
                            icon: <FaPeopleGroup />
                        },
                    ],
                },
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/role"
                ) ? {
                    key: 'role',
                    label: <Link href={pathAdminRoutes.role}>Vai trò</Link>,
                    icon: <SiAdguard />
                } : null,
                accountLogin && accountLogin.role && accountLogin.role.permission.some(
                    (p) => p.method === "GET" && p.path === "/api/v1/admin/role"
                ) ? {
                    key: 'permission',
                    label: <Link href={pathAdminRoutes.permission}>Phân quyền</Link>,
                    icon: <GoLaw />
                } : null,
            ]

        },
        {
            type: 'divider',
        },
        {
            key: 'setting',
            label: 'SETTING',
            type: 'group',
            children: [
                {
                    key: 'setting common',
                    label: 'Cài đặt chung',
                    icon: <IoIosSettings />
                },
                {
                    key: 'document guide',
                    label: 'Tài liệu hướng dẫn',
                    icon: <IoDocumentText />

                },
            ],
        },
    ];

    return (
        <>
            <section style={{ scrollbarWidth: "none" }} className={!collapsed ? 'w-64 overflow-y-scroll' : 'overflow-y-scroll'}>
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={items}
                    inlineCollapsed={collapsed}
                />
            </section>

        </>
    );
}
