'use client'
import '@ant-design/v5-patch-for-react-19';
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


type MenuItem = Required<MenuProps>['items'][number];




export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    const items: MenuItem[] = [
        {
            key: 'home',
            type: 'group',
            label: 'MENU',
            children: [
                {
                    key: 'dashboard',
                    label: <Link href={"/admin/dashboard"}>Dashboard</Link>,
                    icon: <FaHome />
                },
                {
                    key: 'products',
                    label: <Link href={"/admin/products"}>Sản phẩm</Link>,
                    icon: <GiLaptop />
                },
                {
                    key: 'category',
                    label: 'Danh mục sản phẩm',
                    icon: <BiCategory />
                },
                {
                    key: 'discount',
                    label: 'Khuyến mãi',
                    icon: <MoneyCollectOutlined />
                },
                {
                    key: 'order',
                    label: 'Đơn hàng',
                    icon: <ShoppingCartOutlined />
                },
            ],
        },
        {
            type: 'divider',
        },
        {
            key: 'sercurity',
            label: 'SERCURITY',
            type: 'group',
            children: [
                {
                    key: 'user',
                    label: 'Người dùng',
                    icon: <FaUserFriends />,
                    children: [
                        {
                            key: 'employee',
                            label: <Link href={"/admin/employee"}>Thông tin nhân viên</Link>,
                            icon: <IoIosPeople />
                        },
                        {
                            key: 'customer',
                            label: 'Thông tin khách hàng',
                            icon: <FaPeopleGroup />

                        },
                    ],
                },
                {
                    key: 'account',
                    label: 'Tài khoản',
                    icon: <MdManageAccounts />,
                    children: [
                        {
                            key: 'employeeAccount',
                            label: 'Tài khoản nhân viên',
                            icon: <IoIosPeople />


                        },
                        {
                            key: 'customerAccount',
                            label: 'Tài khoản khách hàng',
                            icon: <FaPeopleGroup />
                        },
                    ],
                },
                {
                    key: 'role',
                    label: 'Vai trò',
                    icon: <SiAdguard />
                },
                {
                    key: 'permission',
                    label: <Link href={"/admin/permission"}>Phân quyền</Link>,
                    icon: <GoLaw />
                },
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
