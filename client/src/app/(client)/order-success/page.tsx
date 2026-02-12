'use client'

import { Button, Card, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, HomeOutlined, ShoppingOutlined, PhoneOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Set page title
if (typeof document !== 'undefined') {
    document.title = 'Đặt hàng thành công - Project PC';
}

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
        // Lấy thông tin đơn hàng từ URL params hoặc localStorage
        const orderId = searchParams.get('orderId') || `ORD${Date.now()}`;
        const customerName = searchParams.get('customerName') || 'Khách hàng';
        const phoneNumber = searchParams.get('phone') || '';
        const address = searchParams.get('address') || '';
        const totalAmount = parseInt(searchParams.get('total') || '0');
        const method = searchParams.get('method') || 'COD';

        setOrderInfo({
            orderId,
            customerName,
            phoneNumber,
            address,
            totalAmount,
            method,
        });
    }, [searchParams]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    {/* Header Success Icon */}
                    <motion.div variants={itemVariants} className="text-center mb-8 relative">
                        <motion.div
                            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.3
                            }}
                        >
                            <CheckCircleOutlined className="text-5xl text-green-600 dark:text-green-400" />
                        </motion.div>

                        {/* Floating success emojis */}
                        <motion.div
                            className="absolute -top-5 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                y: [0, -20, -40, -60]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                        >
                            <span className="text-4xl">🎉</span>
                        </motion.div>

                        <motion.div
                            className="absolute top-0 left-1/4"
                            initial={{ opacity: 0, x: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                x: [0, 20, 40, 60]
                            }}
                            transition={{
                                duration: 2.5,
                                delay: 0.5,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            <span className="text-3xl">✨</span>
                        </motion.div>

                        <motion.div
                            className="absolute top-0 right-1/4"
                            initial={{ opacity: 0, x: 0 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                x: [0, -20, -40, -60]
                            }}
                            transition={{
                                duration: 2.5,
                                delay: 1,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            <span className="text-3xl">🎊</span>
                        </motion.div>

                        <Title level={1} className="text-green-600 dark:text-green-400 mb-2">
                            Đặt hàng thành công!
                        </Title>
                        <Paragraph className="text-lg text-gray-600 dark:text-gray-300">
                            Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng chúng tôi
                        </Paragraph>
                    </motion.div>

                    {/* Order Information Card */}
                    <motion.div variants={itemVariants}>
                        <Card
                            className="mb-6 shadow-lg border-0 dark:bg-gray-800"
                            style={{ borderRadius: '16px' }}
                        >
                            <div className="text-center mb-6">
                                <Title level={3} className="text-blue-600 dark:text-blue-400 mb-4">
                                    Thông tin đơn hàng
                                </Title>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 inline-block">
                                    <Text className="text-lg font-bold text-blue-800 dark:text-blue-300">
                                        Mã đơn hàng: #{orderInfo.orderId}
                                    </Text>
                                </div>
                            </div>

                            <Divider />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Text strong className="text-gray-700 dark:text-gray-300 block mb-1">
                                            👤 Người nhận:
                                        </Text>
                                        <Text className="text-lg dark:text-white">
                                            {orderInfo.customerName}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text strong className="text-gray-700 dark:text-gray-300 block mb-1">
                                            📞 Số điện thoại:
                                        </Text>
                                        <Text className="text-lg dark:text-white">
                                            {orderInfo.phoneNumber}
                                        </Text>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Text strong className="text-gray-700 dark:text-gray-300 block mb-1">
                                            📍 Địa chỉ giao hàng:
                                        </Text>
                                        <Text className="text-lg dark:text-white">
                                            {orderInfo.address}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text strong className="text-gray-700 dark:text-gray-300 block mb-1">
                                            💰 Tổng tiền:
                                        </Text>
                                        <Text className="text-xl font-bold text-red-500 dark:text-red-400">
                                            {orderInfo.totalAmount.toLocaleString()} đ
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                                <Text strong className="text-yellow-800 dark:text-yellow-300">
                                    💰 Phương thức thanh toán: {orderInfo.method === 'COD' ? 'Thanh toán bằng tiền mặt (COD)' : 'Thanh toán trực tuyến (PayOS)'}
                                </Text>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Delivery Information */}
                    <motion.div variants={itemVariants}>
                        <Card
                            className="mb-6 shadow-lg border-0 dark:bg-gray-800"
                            style={{ borderRadius: '16px' }}
                        >
                            <Title level={4} className="text-center text-green-600 dark:text-green-400 mb-4">
                                🚚 Thông tin vận chuyển
                            </Title>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="text-2xl mb-2">📦</div>
                                    <Text strong className="block dark:text-white">Đang chuẩn bị hàng</Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        1-2 giờ
                                    </Text>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                    <div className="text-2xl mb-2">🚚</div>
                                    <Text strong className="block dark:text-white">Đang vận chuyển</Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        1-2 ngày
                                    </Text>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                    <div className="text-2xl mb-2">✅</div>
                                    <Text strong className="block dark:text-white">Giao hàng thành công</Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                                        {orderInfo.method === 'COD' ? 'Thanh toán COD' : 'Đã thanh toán online'}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Contact & Support */}
                    <motion.div variants={itemVariants}>
                        <Card
                            className="mb-6 shadow-lg border-0 dark:bg-gray-800"
                            style={{ borderRadius: '16px' }}
                        >
                            <div className="text-center">
                                <Title level={4} className="text-blue-600 dark:text-blue-400 mb-4">
                                    📞 Hỗ trợ khách hàng
                                </Title>
                                <Paragraph className="text-gray-600 dark:text-gray-300 mb-4">
                                    Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ với chúng tôi:
                                </Paragraph>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        size="large"
                                        icon={<PhoneOutlined />}
                                        className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                                        type="primary"
                                    >
                                        Hotline: 1900-xxxx
                                    </Button>
                                    <Button
                                        size="large"
                                        className="bg-green-500 hover:bg-green-600 border-green-500"
                                        type="primary"
                                    >
                                        Chat Zalo
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants}>
                        <Card
                            className="shadow-lg border-0 dark:bg-gray-800"
                            style={{ borderRadius: '16px' }}
                        >
                            <div className="text-center">
                                <Title level={4} className="mb-6 dark:text-white">
                                    Tiếp tục mua sắm
                                </Title>
                                <Space size="large" className="flex flex-col sm:flex-row">
                                    <Link href="/home">
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<HomeOutlined />}
                                            className="w-48 h-12 bg-blue-600 hover:bg-blue-700 border-blue-600"
                                        >
                                            Về trang chủ
                                        </Button>
                                    </Link>
                                    <Link href="/home">
                                        <Button
                                            size="large"
                                            icon={<ShoppingOutlined />}
                                            className="w-48 h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                                        >
                                            Tiếp tục mua sắm
                                        </Button>
                                    </Link>
                                </Space>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Thank You Message */}
                    <motion.div variants={itemVariants} className="text-center mt-8">
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-6">
                            <Title level={3} className="text-white mb-2">
                                🎉 Cảm ơn bạn đã tin tướng chúng tôi! 🎉
                            </Title>
                            <Paragraph className="text-white mb-0 text-lg">
                                Đơn hàng của bạn sẽ được xử lý và giao đến tay bạn một cách nhanh nhất.
                                Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng nhất!
                            </Paragraph>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}