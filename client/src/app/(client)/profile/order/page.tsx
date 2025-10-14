'use client';

import React, { useState } from 'react';
import { Steps, Card, Button, Divider, Tag, Image } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TruckOutlined, CloseCircleOutlined, UndoOutlined } from '@ant-design/icons';
import Link from 'next/link';
import {
    OrderPageSkeleton,
    ProfilePageSkeleton
} from "@/components/Skeletons";
import { IOrderData } from '@/types/model.client';
import { useQuery } from '@tanstack/react-query';
import useAuthUser from '@/hooks/useAuthUser';
import { orderClientService } from '@/services/client/order.client.service';
import { DynamicMetadata } from "@/components/common/DynamicMetadata";

interface IOrderItem {
    id: string,
    productName: string,
    quantity: number,
    price: number,
    originalPrice: number,
    image: string,
    status: string,
    slug: string,
}

export default function OrderPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const { user } = useAuthUser();

    const { data: dataListOrder, isLoading: isLoadingOrder } = useQuery<IOrderData[] | []>({
        queryKey: ['get-order-by-guest-id', user?.id], // key để cache
        queryFn: () => orderClientService.getOrdersByGuestId(user?.id as string),
        enabled: !!user?.id, // 5 phút cache không gọi lại
    });



    // Mock data đơn hàng
    const orderData = {
        0: // Chờ xác nhận
            dataListOrder?.filter((order: IOrderData) => order.status === 'PENDING').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'pending'
                }) as IOrderItem);
                return acc.concat(items);
            }, []),
        1:  // Vận chuyển
            dataListOrder?.filter((order: IOrderData) => order.status === 'SHIPPING').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'shipping'
                }) as IOrderItem);
                return acc.concat(items);
            }, []),
        2: // Chờ giao hàng
            dataListOrder?.filter((order: IOrderData) => order.status === 'DELIVERED').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'delivery'
                }) as IOrderItem);
                return acc.concat(items);
            }, []),
        3:  // Hoàn thành
            dataListOrder?.filter((order: IOrderData) => order.status === 'COMPLETED').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'completed'
                }) as IOrderItem);
                return acc.concat(items);
            }, []),
        4: // Đã hủy
            dataListOrder?.filter((order: IOrderData) => order.status === 'CANCELLED').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'cancelled'
                }) as IOrderItem);
                return acc.concat(items);
            }, []),
        5: // Trả hàng/Hoàn tiền
            dataListOrder?.filter((order: IOrderData) => order.status === 'REFUNDED').reduce((acc: IOrderItem[], order) => {
                const items = order.orderDetail?.map(item => ({
                    id: order._id,
                    productName: item.product.name,
                    quantity: item.quantity || 1,
                    price: item.product.newPrice || 0,
                    originalPrice: item.product.oldPrice || 0,
                    image: item.product.images[0] || '/laptop.png',
                    slug: item.product.slug || '',
                    status: 'refund'
                }) as IOrderItem);
                return acc.concat(items);
            }, [])
    };

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

    if (isLoadingOrder) {
        return (
            <ProfilePageSkeleton>
                <OrderPageSkeleton />
            </ProfilePageSkeleton>
        )
    }

    return (
        <>
            <DynamicMetadata
                title={`Quản lý đơn hàng (${dataListOrder?.length || 0} đơn) - PC Store`}
                description="Theo dõi và quản lý đơn hàng của bạn tại PC Store. Xem trạng thái giao hàng, lịch sử mua hàng và chi tiết đơn hàng."
                keywords="quản lý đơn hàng, theo dõi đơn hàng, lịch sử mua hàng, đơn hàng của tôi"
                ogTitle="Quản lý đơn hàng - PC Store"
                ogDescription="Theo dõi trạng thái và quản lý đơn hàng của bạn một cách dễ dàng"
            />
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
                            {user && user.avatar ? (
                                <Image src={user.avatar} alt="User Avatar" width={40} height={40} className="rounded-full" />
                            ) : (
                                <>
                                    <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                                </>
                            )}
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>{user?.fullname || ""}</h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/detail"}>
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
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/wishlist"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-heart w-9"></i>
                                    <span className='font-medium'>Danh sách yêu thích</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Quản lý địa chỉ</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-100 rounded-lg text-stone-600' href={"/home"}>
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
                                                {order.status === 'cancelled' || order.status === 'delivery' || order.status === 'refund' ?
                                                    null
                                                    :
                                                    <Button type="link" size="small" className="text-blue-500">
                                                        Hủy đơn hàng/Trả hàng
                                                    </Button>
                                                }

                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {order.status === 'completed' &&
                                                    <span className="text-green-500 font-medium">Đơn hàng đã giao thành công</span>
                                                }
                                                {order.status === 'pending' &&
                                                    <span className="text-red-500 font-medium">Đơn hàng đang chờ xử lý</span>
                                                }
                                                {order.status === 'cancelled' &&
                                                    <span className="text-gray-500 font-medium">Đơn hàng đã bị hủy</span>
                                                }
                                                {order.status === 'shipping' &&
                                                    <span className="text-blue-500 font-medium">Đơn hàng đang được vận chuyển</span>
                                                }
                                                {order.status === 'delivery' &&
                                                    <span className="text-cyan-500 font-medium">Đơn hàng đang chờ giao</span>
                                                }
                                                {order.status === 'refund' &&
                                                    <span className="text-purple-500 font-medium">Đơn hàng đã được hoàn tiền</span>
                                                }


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
                                            <div className="flex items-center space-x-3">
                                                <Link type='link' href={`/product/${order.slug}`} className="!border-[1px] !px-10 !py-1 rounded-md !border-red-500 !text-red-500 hover:!bg-red-50">
                                                    Mua Lại
                                                </Link>
                                                <Button type="default">
                                                    Liên Hệ Người Bán
                                                </Button>
                                            </div>
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