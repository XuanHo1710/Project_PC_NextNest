'use client';

import React, { useState, useEffect } from 'react';
import { Steps, Card, Button, Divider, Space, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TruckOutlined, CloseCircleOutlined, UndoOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import {
    OrderPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";

export default function OrderPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);

    // Mock data đơn hàng
    const orderData = {
        0: [ // Chờ xác nhận
            {
                id: 'DH123456',
                productName: 'Laptop Gaming ASUS ROG',
                quantity: 1,
                price: 25000000,
                originalPrice: undefined,
                status: 'pending',
                image: '/laptop.png'
            }
        ],
        1: [ // Vận chuyển
            {
                id: 'DH789012',
                productName: 'Chuột Gaming Logitech G502',
                quantity: 2,
                price: 1500000,
                originalPrice: undefined,
                status: 'shipping',
                image: '/laptop.png'
            }
        ],
        2: [ // Chờ giao hàng
            {
                id: 'DH345678',
                productName: 'Bàn phím cơ Corsair K70',
                quantity: 1,
                price: 2500000,
                originalPrice: undefined,
                status: 'delivery',
                image: '/laptop.png'
            }
        ],
        3: [ // Hoàn thành
            {
                id: 'CALA33',
                productName: 'Bánh Quy Viên Kem Socola Star Cup Thái Lan (100 cốc)',
                quantity: 1,
                price: 75000,
                originalPrice: 78000,
                status: 'completed',
                image: '/laptop.png'
            }
        ],
        4: [ // Đã hủy
            {
                id: 'DH999999',
                productName: 'Tai nghe Sony WH-1000XM4',
                quantity: 1,
                price: 8500000,
                originalPrice: undefined,
                status: 'cancelled',
                image: '/laptop.png'
            }
        ],
        5: [ // Trả hàng/Hoàn tiền
            {
                id: 'DH777777',
                productName: 'Màn hình Dell UltraSharp 27',
                quantity: 1,
                price: 7500000,
                originalPrice: undefined,
                status: 'refund',
                image: '/laptop.png'
            }
        ]
    };

    useEffect(() => {
        // Simulate initial data fetch
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // Simulate a 1.5-second load time

        return () => clearTimeout(timer);
    }, []);

    const stepItems = [
        {
            title: 'Xác nhận',
            icon: <ClockCircleOutlined />,
        },
        {
            title: 'Vận chuyển',
            icon: <TruckOutlined />,
        },
        {
            title: 'Chờ giao',
            icon: <TruckOutlined />,
        },
        {
            title: 'Hoàn thành',
            icon: <CheckCircleOutlined />,
        },
        {
            title: 'Đã hủy',
            icon: <CloseCircleOutlined />,
        },
        {
            title: 'Trả hàng',
            icon: <UndoOutlined />,
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'shipping': return 'blue';
            case 'delivery': return 'cyan';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            case 'refund': return 'purple';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'shipping': return 'Đang giao hàng';
            case 'delivery': return 'Chờ giao hàng';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy đơn';
            case 'refund': return 'Trả hàng/Hoàn tiền';
            default: return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const currentOrders = orderData[currentStep as keyof typeof orderData] || [];

    if (loading) {
        return (
            <ProfilePageSkeleton>
                <OrderPageSkeleton />
            </ProfilePageSkeleton>
        )
    }

    return (
        <>
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <Link href="/profile/detail" className="font-medium text-lg text-stone-500 dark:text-white mr-3">Hồ sơ người dùng</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Quản lý đơn hàng</h3>
                </div>

                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    {/* Sidebar */}
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>Nguyễn Xuân Hồ</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5 rounded-lg' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/home"}>
                                <li className='inline-block'>
                                    <i className="fas fa-sign-out-alt w-9"></i>
                                    <span className='font-medium'>Đăng xuất</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white mb-6'>
                            Quản lý đơn hàng
                        </h2>

                        {/* Steps Navigation */}
                        <div className="my-6">
                            <Steps
                                current={currentStep}
                                onChange={setCurrentStep}
                                type="navigation"
                                size="small"
                                style={{ width: "100%" }} // chiếm hết chiều ngang
                                responsive
                                className="site-navigation-steps"
                                items={stepItems}
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="mb-6">
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {currentOrders.length > 0 ? (
                                currentOrders.map((order, index) => (
                                    <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-semibold">{order.id}</span>
                                                <Button type="link" size="small" className="text-blue-500">
                                                    Chat
                                                </Button>
                                                <Button type="link" size="small" className="text-blue-500">
                                                    Xem Shop
                                                </Button>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-green-500 font-medium">Đơn hàng đã giao thành công</span>
                                                <Tag color={getStatusColor(order.status)} className="font-medium">
                                                    {getStatusText(order.status)}
                                                </Tag>
                                            </div>
                                        </div>

                                        <Divider className="my-4" />

                                        <div className="flex items-center space-x-4">
                                            <Image
                                                src={order.image}
                                                alt={order.productName}
                                                width={80}
                                                height={80}
                                                className="w-20 h-20 object-cover rounded-lg border"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg mb-1">{order.productName}</h3>
                                                <p className="text-gray-600 dark:text-gray-300">x{order.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                {order.originalPrice && (
                                                    <p className="text-gray-400 line-through text-sm">
                                                        {formatCurrency(order.originalPrice)}
                                                    </p>
                                                )}
                                                <p className="text-red-500 font-bold text-lg">
                                                    {formatCurrency(order.price)}
                                                </p>
                                            </div>
                                        </div>

                                        <Divider className="my-4" />

                                        <div className="flex justify-between items-center">
                                            <div className="text-right">
                                                <span className="text-gray-600 dark:text-gray-300">Thành tiền: </span>
                                                <span className="text-red-500 font-bold text-xl">
                                                    {formatCurrency(order.price * order.quantity)}
                                                </span>
                                            </div>
                                            <Space>
                                                <Button className="border-red-500 text-red-500 hover:bg-red-50">
                                                    Mua Lại
                                                </Button>
                                                <Button type="default">
                                                    Liên Hệ Người Bán
                                                </Button>
                                            </Space>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                                    <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

}