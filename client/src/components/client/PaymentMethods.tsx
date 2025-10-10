'use client';

import React, { useState } from 'react';
import { Radio, Button, Card, Space, Typography, RadioChangeEvent } from 'antd';
import { CreditCardOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import { paymentClientService } from '@/services/client/payment.client.service';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { pathClientRoutes } from '@/config/route';
import { IOrderData } from '@/types/model.client';

const { Title, Text } = Typography;


export default function PaymentMethods({ orderData }: { orderData: IOrderData }) {
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePaymentMethodChange = (e: RadioChangeEvent) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        if (paymentMethod === 'cod') {
            // Xử lý thanh toán khi nhận hàng
            toast.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');

            // Tạo thông tin đơn hàng mẫu để chuyển đến trang success
            const orderInfo = {
                orderId: `ORD${Date.now()}`,
                customerName: orderData.customerInfo.fullname, // Có thể lấy từ form hoặc context
                phone: orderData.customerInfo.phone,
                address: orderData.customerInfo.address,
                total: orderData.totalAmount || 0
            };

            // Chuyển hướng đến trang order-success với thông tin đơn hàng
            const params = new URLSearchParams({
                orderId: orderInfo.orderId,
                customerName: orderInfo.customerName,
                phone: orderInfo.phone,
                address: orderInfo.address,
                total: orderInfo.total.toString()
            });

            router.push(`${pathClientRoutes.orderSuccess}?${params.toString()}`);
            return;
        }

        if (paymentMethod === 'vnpay' && orderData) {
            try {
                setLoading(true);
                const paymentUrl = await paymentClientService.createVnpayPayment({
                    orderId: `DH${Date.now().toString().slice(-6)}`,
                    totalAmount: orderData.totalAmount,
                    orderDescription: `Thanh toan don hang`
                });


                if (paymentUrl && paymentUrl?.vnpayResponse) {
                    window.location.href = paymentUrl?.vnpayResponse as string || "";
                }

                // Chuyển hướng đến trang thanh toán VNPay
            } catch (error) {
                console.error('Lỗi tạo thanh toán VNPay:', error);
                toast.error('Có lỗi xảy ra khi tạo thanh toán VNPay');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Card title="Phương thức thanh toán" className="!w-full shadow-xl border-0">
            <Space direction="vertical" className="!w-full" size="large">
                <Radio.Group
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="!w-full space-y-4 custom-radio-group"
                >
                    {[
                        {
                            key: 'cod',
                            title: 'Thanh toán khi nhận hàng (COD)',
                            desc: 'Thanh toán bằng tiền mặt khi nhận hàng',
                            icon: <DeliveredProcedureOutlined className="!text-2xl !text-orange-500" />,
                        },
                        {
                            key: 'vnpay',
                            title: 'Thanh toán trực tuyến',
                            desc: 'Thanh toán qua VNPay (ATM, Visa, MasterCard)',
                            icon: <CreditCardOutlined className="!text-2xl !text-blue-500" />,
                        },
                    ].map((method) => (
                        <label
                            key={method.key}
                            htmlFor={method.key}
                            className={
                                `block w-full cursor-pointer rounded-xl border transition-all duration-200 ${paymentMethod === method.key
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/30'}`
                            }
                        >
                            <Radio
                                id={method.key}
                                value={method.key}
                                className="hidden"
                            />
                            <div className="flex items-center gap-3 p-4 w-full">
                                {method.icon}
                                <div className="flex flex-col">
                                    <Title level={5} className="!mb-1 !text-base !font-semibold">
                                        {method.title}
                                    </Title>
                                    <Text type="secondary" className="!text-sm">
                                        {method.desc}
                                    </Text>
                                </div>
                            </div>
                        </label>
                    ))}
                </Radio.Group>

                <Button
                    type="primary"
                    size="large"
                    onClick={handlePayment}
                    loading={loading}
                    className="w-full h-12 text-lg font-semibold hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                    disabled={!orderData}
                >
                    {paymentMethod === 'cod' ? 'Đặt hàng' : 'Thanh toán ngay'}
                </Button>

                {!orderData && (
                    <Text type="secondary" className="text-center block">
                        Vui lòng cung cấp thông tin đơn hàng để tiếp tục
                    </Text>
                )}
            </Space>


        </Card>
    );
}