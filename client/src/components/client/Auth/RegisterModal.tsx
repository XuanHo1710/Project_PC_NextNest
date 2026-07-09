'use client';

import { useState } from 'react';
import { Button, Divider, Form, Input, Modal, Result } from 'antd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IRegisterDto } from '@/types/auth';
import useAuthUser from '@/hooks/useAuthUser';
import { MailOutlined } from '@ant-design/icons';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    switchToLogin: () => void;
}

interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterModal({ isOpen, onClose, switchToLogin }: RegisterModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const { register, loginWithGoogle } = useAuthUser();

    const onFinish = async (values: RegisterFormValues) => {
        setLoading(true);
        try {
            const fullname = `${values.firstName} ${values.lastName}`;
            const success = await register({
                email: values.email,
                password: values.password,
                fullname,
                phone: values.phone
            } as IRegisterDto);


            if (success) {
                setRegisteredEmail(values.email);
                setRegistered(true);
                form.resetFields();
            }
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRegistered(false);
        setRegisteredEmail('');
        onClose();
    };

    const handleSwitchToLogin = () => {
        setRegistered(false);
        setRegisteredEmail('');
        switchToLogin();
    };

    const handleGoogleRegister = () => {
        onClose();
        loginWithGoogle();
    };

    // Show verification success screen
    if (registered) {
        return (
            <Modal
                open={isOpen}
                onCancel={handleClose}
                footer={null}
                width={500}
                centered
            >
                <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
                        <MailOutlined className="!text-4xl text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Kiểm tra email của bạn</h2>
                    <p className="text-gray-500 mb-1">
                        Chúng tôi đã gửi email kích hoạt đến:
                    </p>
                    <p className="text-blue-600 font-semibold text-lg mb-4">{registeredEmail}</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 mx-4">
                        <p className="text-blue-700 text-sm">
                            Vui lòng mở email và bấm vào liên kết kích hoạt để hoàn tất đăng ký. Link có hiệu lực trong 24 giờ.
                        </p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSwitchToLogin}
                        className="h-12 px-8 text-base font-semibold"
                    >
                        Đã kích hoạt? Đăng nhập ngay
                    </Button>
                    <p className="text-gray-400 text-xs mt-4">
                        Không nhận được email? Kiểm tra thư mục spam hoặc thử đăng nhập để gửi lại.
                    </p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            title={<h2 className="text-xl font-bold">Đăng ký tài khoản</h2>}
            footer={[]}
            width={550}
            centered
        >
            <p className="mb-5">Đăng ký tài khoản để nhận được nhiều ưu đãi và theo dõi đơn hàng dễ dàng</p>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="firstName"
                        label={<span className="text-base">Họ</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ của bạn' },
                            { min: 2, message: 'Họ phải có ít nhất 2 ký tự' }
                        ]}
                    >
                        <Input className="py-3 text-base" size="large" placeholder="Nhập họ" />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label={<span className="text-base">Tên</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên của bạn' },
                            { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                        ]}
                    >
                        <Input className="py-3 text-base" size="large" placeholder="Nhập tên" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="email"
                    label={<span className="text-base">Email</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập email của bạn' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input className="py-3 text-base" size="large" placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label={<span className="text-base">Số điện thoại</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: 'Số điện thoại không hợp lệ' }
                    ]}
                >
                    <Input className="py-3 text-base" size="large" placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={<span className="text-base">Mật khẩu</span>}
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                        {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                            message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số'
                        }
                    ]}
                >
                    <Input.Password
                        className="py-3 text-base"
                        size="large"
                        placeholder="Nhập mật khẩu"
                        visibilityToggle={{
                            visible: passwordVisible,
                            onVisibleChange: setPasswordVisible
                        }}
                        iconRender={visible => (visible ? <FaEye /> : <FaEyeSlash />)}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label={<span className="text-base">Xác nhận mật khẩu</span>}
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        className="py-3 text-base"
                        size="large"
                        placeholder="Xác nhận mật khẩu"
                        visibilityToggle={{
                            visible: confirmPasswordVisible,
                            onVisibleChange: setConfirmPasswordVisible
                        }}
                        iconRender={visible => (visible ? <FaEye /> : <FaEyeSlash />)}
                    />
                </Form.Item>

                <Form.Item className="mt-6">
                    <Button
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        className="bg-blue-500 text-white font-semibold py-3 h-auto w-full hover:bg-blue-700 text-base transition-all"
                    >
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ borderColor: "#c9c9c9" }} plain className="text-base">hoặc đăng ký bằng</Divider>

            <button
                onClick={handleGoogleRegister}
                className="bg-blue-500 hover:bg-blue-700 flex items-center justify-center gap-3 text-white py-3 w-full font-semibold rounded-md text-base transition-all"
            >
                <img
                    alt="Google Logo"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    className="w-6 h-6 bg-white p-1 rounded-full object-contain"
                />
                Đăng ký với Google
            </button>

            <p className="text-center mt-5 text-base">
                Bạn đã có tài khoản? <span onClick={handleSwitchToLogin} className="text-blue-500 cursor-pointer hover:underline font-medium">Đăng nhập ngay!</span>
            </p>
        </Modal>
    );
}