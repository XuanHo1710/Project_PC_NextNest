'use client'

import { Button, Card, Typography, Space, Divider, Steps } from 'antd';
import {
    CheckCircleOutlined, HomeOutlined, ShoppingOutlined,
    PhoneOutlined, UserOutlined, EnvironmentOutlined,
    DollarOutlined, InboxOutlined, CarOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const [orderInfo, setOrderInfo] = useState({
        orderId: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        totalAmount: 0,
        method: 'COD',
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.title = 'Đặt hàng thành công - Project PC';
        }

        const orderId = searchParams.get('orderId') || `ORD${Date.now()}`;
        const customerName = searchParams.get('customerName') || 'Khách hàng';
        const phoneNumber = searchParams.get('phone') || '';
        const address = searchParams.get('address') || '';
        const totalAmount = parseInt(searchParams.get('total') || '0');
        const method = searchParams.get('method') || 'COD';

        setOrderInfo({ orderId, customerName, phoneNumber, address, totalAmount, method });
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-10">
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <CheckCircleOutlined className="text-4xl text-green-600 dark:text-green-400" />
                        </motion.div>
                        <Title level={2} className="text-green-600 dark:text-green-400 !mb-1">
                            Đặt hàng thành công!
                        </Title>
                        <Paragraph className="text-gray-500 dark:text-gray-400">
                            Cảm ơn bạn đã đặt hàng tại Project PC
                        </Paragraph>
                    </div>

                    {/* Order Info Card */}
                    <Card className="mb-5 shadow-sm" styles={{ body: { padding: '24px 28px' } }}>
                        <div className="text-center mb-5">
                            <Text className="text-gray-500 text-sm">Mã đơn hàng</Text>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                #{orderInfo.orderId}
                            </div>
                        </div>

                        <Divider className="!my-4" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <UserOutlined className="text-gray-400 mt-1" />
                                <div>
                                    <Text className="text-gray-500 text-xs block">Người nhận</Text>
                                    <Text strong>{orderInfo.customerName}</Text>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <PhoneOutlined className="text-gray-400 mt-1" />
                                <div>
                                    <Text className="text-gray-500 text-xs block">Số điện thoại</Text>
                                    <Text strong>{orderInfo.phoneNumber}</Text>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 sm:col-span-2">
                                <EnvironmentOutlined className="text-gray-400 mt-1" />
                                <div>
                                    <Text className="text-gray-500 text-xs block">Địa chỉ giao hàng</Text>
                                    <Text strong>{orderInfo.address}</Text>
                                </div>
                            </div>
                        </div>

                        <Divider className="!my-4" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarOutlined className="text-gray-400" />
                                <Text className="text-gray-500">
                                    {orderInfo.method === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến'}
                                </Text>
                            </div>
                            <Text strong className="text-red-500 text-xl">
                                {orderInfo.totalAmount.toLocaleString()}đ
                            </Text>
                        </div>
                    </Card>

                    {/* Delivery Timeline */}
                    <Card className="mb-5 shadow-sm" styles={{ body: { padding: '24px 28px' } }}>
                        <Text strong className="block mb-4">Tiến trình đơn hàng</Text>
                        <Steps
                            current={0}
                            size="small"
                            items={[
                                { title: 'Đang xử lý', icon: <InboxOutlined /> },
                                { title: 'Đang giao', icon: <CarOutlined /> },
                                { title: 'Đã giao', icon: <CheckCircleOutlined /> },
                            ]}
                        />
                    </Card>

                    {/* Actions */}
                    <Card className="shadow-sm" styles={{ body: { padding: '24px 28px' } }}>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/home">
                                <Button type="primary" size="large" icon={<HomeOutlined />} className="w-full sm:w-auto">
                                    Về trang chủ
                                </Button>
                            </Link>
                            <Link href="/home">
                                <Button size="large" icon={<ShoppingOutlined />} className="w-full sm:w-auto">
                                    Tiếp tục mua sắm
                                </Button>
                            </Link>
                        </div>
                        <div className="text-center mt-4">
                            <Text className="text-gray-400 text-sm">
                                Liên hệ hỗ trợ: <a href="tel:1900xxxx" className="text-blue-500">1900-xxxx</a>
                            </Text>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}