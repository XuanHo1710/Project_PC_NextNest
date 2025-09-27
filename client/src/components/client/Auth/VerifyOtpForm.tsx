'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function VerifyOtpForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Lấy email từ localStorage
        const storedEmail = localStorage.getItem('resetEmail');
        if (!storedEmail) {
            message.error('Không tìm thấy thông tin email. Vui lòng thực hiện lại từ đầu.');
            router.push('/forgot-password');
            return;
        }
        setEmail(storedEmail);

        // Bắt đầu đếm ngược
        startCountdown();
    }, [router]);

    const startCountdown = () => {
        // Đặt thời gian đếm ngược ban đầu
        setCountdown(60);
        setCanResend(false);

        // Lưu thời điểm kết thúc đếm ngược
        const endTime = Date.now() + 60 * 1000;

        const timer = setInterval(() => {
            const secondsLeft = Math.round((endTime - Date.now()) / 1000);

            if (secondsLeft <= 0) {
                clearInterval(timer);
                setCountdown(0);
                setCanResend(true);
            } else {
                setCountdown(secondsLeft);
            }
        }, 1000);

        return () => clearInterval(timer);
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        try {
            setLoading(true);
            // Giả lập gọi API gửi lại OTP
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success('Mã xác thực mới đã được gửi đến email của bạn!');
            startCountdown();
        } catch (error) {
            console.error('Lỗi gửi lại mã OTP:', error);
            message.error('Có lỗi xảy ra khi gửi lại mã xác thực. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async () => {
        setLoading(true);

        try {
            // Lấy giá trị OTP từ form
            const formValues = form.getFieldsValue();
            const otpDigits = formValues.otp || [];
            const otpValue = otpDigits.join('');

            if (!otpValue || otpValue.length !== 6) {
                message.error('Vui lòng nhập đủ 6 chữ số mã OTP');
                return;
            }

            // Giả lập gọi API xác thực OTP
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success('Mã xác thực hợp lệ!');

            // Lưu token OTP vào localStorage (giả lập)
            localStorage.setItem('otpToken', 'valid-otp-token-' + Date.now());

            // Chuyển đến trang đặt lại mật khẩu
            router.push('/reset-password');
        } catch (error) {
            console.error('Lỗi xác thực OTP:', error);
            message.error('Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-gray-600 mb-6 text-center">
                <p>Chúng tôi đã gửi mã xác thực đến email:</p>
                <p className="font-medium text-gray-800 mt-1">{email}</p>
                <p className="mt-4">Vui lòng kiểm tra hộp thư của bạn và nhập mã xác thực gồm 6 chữ số.</p>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-4"
            >
                {/* Input OTP sử dụng Tailwind CSS thay vì Ant Design */}
                <div className="mt-6 mb-8">
                    <label className="block text-base font-medium mb-2">Mã OTP</label>
                    <div className="flex justify-between gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Form.Item
                                key={index}
                                name={['otp', index]}
                                className="m-0"
                                rules={[{ required: true, message: '' }]}
                            >
                                <Input
                                    className="text-center text-xl w-12 h-12 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                                    maxLength={1}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value && /^\d+$/.test(value) && index < 5) {
                                            // Focus vào ô tiếp theo
                                            const nextInput = document.querySelector(`input[name="otp[${index + 1}]"]`) as HTMLInputElement;
                                            if (nextInput) nextInput.focus();
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                                            // Focus vào ô trước đó khi nhấn Backspace
                                            const prevInput = document.querySelector(`input[name="otp[${index - 1}]"]`) as HTMLInputElement;
                                            if (prevInput) prevInput.focus();
                                        }
                                    }}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pasteData = e.clipboardData.getData('text');
                                        const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');

                                        digits.forEach((digit, i) => {
                                            if (i < 6) {
                                                form.setFieldValue(['otp', i], digit);

                                                // Focus vào ô cuối cùng hoặc ô tiếp theo sau khi dán
                                                if (i === digits.length - 1) {
                                                    const nextInput = document.querySelector(`input[name="otp[${i}]"]`) as HTMLInputElement;
                                                    if (nextInput) nextInput.focus();
                                                }
                                            }
                                        });
                                    }}
                                />
                            </Form.Item>
                        ))}
                    </div>
                </div>

                <Form.Item hidden name="completeOtp" dependencies={[['otp', 0], ['otp', 1], ['otp', 2], ['otp', 3], ['otp', 4], ['otp', 5]]}>
                    {({ getFieldValue }) => {
                        const otp0 = getFieldValue(['otp', 0]) || '';
                        const otp1 = getFieldValue(['otp', 1]) || '';
                        const otp2 = getFieldValue(['otp', 2]) || '';
                        const otp3 = getFieldValue(['otp', 3]) || '';
                        const otp4 = getFieldValue(['otp', 4]) || '';
                        const otp5 = getFieldValue(['otp', 5]) || '';

                        const completeOtp = otp0 + otp1 + otp2 + otp3 + otp4 + otp5;

                        if (completeOtp.length === 6) {
                            form.setFieldValue('completeOtp', completeOtp);
                        }
                        return null;
                    }}
                </Form.Item>

                <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        Chưa nhận được mã xác thực?
                    </p>
                    <Button
                        type="link"
                        onClick={handleResendOtp}
                        disabled={!canResend}
                        loading={loading && canResend}
                        className="text-blue-500 hover:text-blue-700 p-0 h-auto"
                    >
                        {canResend ? 'Gửi lại mã' : `Gửi lại sau (${countdown < 10 ? '0' + countdown : countdown}s)`}
                    </Button>
                </div>

                <Form.Item>
                    <Button
                        htmlType="submit"
                        loading={loading && !canResend}
                        size="large"
                        className="bg-blue-500 text-white font-semibold py-3 h-auto w-full hover:bg-blue-700 text-base transition-all rounded-lg"
                    >
                        Xác thực
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}