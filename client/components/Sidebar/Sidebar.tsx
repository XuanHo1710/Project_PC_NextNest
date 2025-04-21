'use client'
import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { SettingOutlined } from '@ant-design/icons';
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


type MenuItem = Required<MenuProps>['items'][number];




export const Sidebar: React.FC = () => {
    const items: MenuItem[] = [
        {
            key: 'home',
            label: <Link href={"/admin/dashboard"}>Dashboard</Link>,
            icon: <FaHome />
        },
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
            key: 'role',
            label: 'Vai trò',
            icon: <SiAdguard />
        },
        {
            key: 'permission',
            label: <Link href={"/admin/permission"}>Phân quyền</Link>,
            icon: <GoLaw />
        },
        {
            type: 'divider',
        },
        {
            key: 'grp',
            label: 'Cài đặt',
            icon: <SettingOutlined />,
            children: [
                { 
                    key: '13', 
                    label: 'Cài đặt chung',
                    icon: <IoIosSettings />
                },
                { 
                    key: '14', 
                    label: 'Tài liệu hướng dẫn',
                    icon: <IoDocumentText />
    
                },
            ],
        },
    ];

    return (
        <>
        <section>
            <Menu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={items}
            />
        </section>

        </>
    );
}
