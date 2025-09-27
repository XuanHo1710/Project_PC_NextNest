'use client';
import ForgotPasswordForm from '@/components/client/Auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h1>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}