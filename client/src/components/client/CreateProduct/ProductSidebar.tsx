'use client';

import { Menu } from 'antd';
import {
    ShoppingOutlined,
    TagsOutlined,
    AppstoreOutlined,
    BookOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const menuItems: MenuProps['items'] = [
    {
        key: '/create-product',
        icon: <ShoppingOutlined />,
        label: 'Tạo sản phẩm',
    },
    {
        key: '/create-product/my-products',
        icon: <UnorderedListOutlined />,
        label: 'Sản phẩm đã đăng bán',
    },
    {
        key: '/create-product/attributes',
        icon: <TagsOutlined />,
        label: 'Thuộc tính sản phẩm',
    },
    {
        key: '/create-product/attribute-values',
        icon: <AppstoreOutlined />,
        label: 'Giá trị thuộc tính',
    },
    { type: 'divider' },
    {
        key: '/create-product/guide',
        icon: <BookOutlined />,
        label: 'Hướng dẫn đăng bài',
    },
];

export default function ProductSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        router.push(key);
    };

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b">
                <h3 className="text-base font-bold m-0">Quản lý sản phẩm</h3>
                <p className="text-xs text-gray-500 m-0 mt-1">Đăng bán & quản lý thuộc tính</p>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ borderInlineEnd: 'none' }}
                className="[&_.ant-menu-item-selected]:!bg-blue-50 [&_.ant-menu-item-selected]:!text-blue-600"
            />
        </div>
    );
}
