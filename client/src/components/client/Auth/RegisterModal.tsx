'use client';

import { useState } from 'react';
import { Button, Divider, Form, Image, Input, Modal } from 'antd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IRegisterDto } from '@/types/auth';
import useAuthUser from '@/hooks/useAuthUser';

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
                // Reset form sau khi đăng ký thành công
                form.resetFields();
                // Đóng modal và chuyển sang modal đăng nhập
                onClose();
                switchToLogin();
            }
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        onClose(); // Đóng modal trước khi redirect
        loginWithGoogle();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
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
                <Image
                    preview={false}
                    width={24}
                    alt="Google Logo"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
                    className="bg-white p-0.5 rounded-full"
                />
                Đăng ký với Google
            </button>

            <p className="text-center mt-5 text-base">
                Bạn đã có tài khoản? <span onClick={switchToLogin} className="text-blue-500 cursor-pointer hover:underline font-medium">Đăng nhập ngay!</span>
            </p>
        </Modal>
    );
}