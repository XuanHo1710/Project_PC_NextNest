'use client';

import React, { useState } from 'react';
import { Radio, Button, Card, Space, Typography, RadioChangeEvent } from 'antd';
import { CreditCardOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import { paymentClientService } from '@/services/client/payment.service';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

interface PaymentMethodsProps {
    orderData?: {
        orderId: string;
        amount: number;
        orderDescription: string;
    };
}

export default function PaymentMethods({ orderData }: PaymentMethodsProps) {
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
    const [loading, setLoading] = useState(false);

    const handlePaymentMethodChange = (e: RadioChangeEvent) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async () => {
        if (paymentMethod === 'cod') {
            // Xử lý thanh toán khi nhận hàng
            toast.success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');
            // TODO: Call API to create order with COD payment
            return;
        }

        if (paymentMethod === 'vnpay' && orderData) {
            try {
                setLoading(true);
                const paymentUrl = await paymentClientService.createVnpayPayment({
                    orderId: orderData.orderId,
                    amount: orderData.amount,
                    orderDescription: orderData.orderDescription
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
        <Card title="Phương thức thanh toán" className="w-full shadow-xl border-0">
            <Space direction="vertical" className="w-full" size="large">
                <Radio.Group
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="!w-full"
                    style={{ width: '100%' }}
                >
                    <div className="space-y-4">
                        <div className="w-full">
                            <Radio value="cod" className="!w-full" style={{ flex: 1, display: 'flex' }}>
                                <div className="w-full flex-1">
                                    <Card
                                        hoverable
                                        className={`cursor-pointer !w-full !flex-1 transition-all duration-200 ${paymentMethod === 'cod'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                            }`}
                                        styles={{ body: { padding: '16px' } }}
                                    >
                                        <Space align="center" className='!w-full !flex-1'>
                                            <DeliveredProcedureOutlined
                                                className="text-2xl text-orange-500 !w-full !flex-1"
                                            />
                                            <div className='!w-full !flex-1'>
                                                <Title level={5} className="mb-1">
                                                    Thanh toán khi nhận hàng (COD)
                                                </Title>
                                                <Text type="secondary">
                                                    Thanh toán bằng tiền mặt khi nhận hàng
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            </Radio>
                        </div>

                        <div className="w-full">
                            <Radio value="vnpay" className="w-full" style={{ width: '100%', display: 'flex' }}>
                                <div className="w-full flex-1">
                                    <Card
                                        hoverable
                                        className={`cursor-pointer transition-all duration-200 ${paymentMethod === 'vnpay'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                            }`}
                                        styles={{ body: { padding: '16px' } }}
                                    >
                                        <Space align="center">
                                            <CreditCardOutlined
                                                className="text-2xl text-blue-500"
                                            />
                                            <div>
                                                <Title level={5} className="mb-1">
                                                    Thanh toán trực tuyến
                                                </Title>
                                                <Text type="secondary">
                                                    Thanh toán qua VNPay (ATM, Visa, MasterCard)
                                                </Text>
                                            </div>
                                        </Space>
                                    </Card>
                                </div>
                            </Radio>
                        </div>
                    </div>
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