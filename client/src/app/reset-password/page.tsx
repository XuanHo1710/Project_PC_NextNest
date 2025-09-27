'use client';
import ResetPasswordForm from '@/components/client/Auth/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Đặt lại mật khẩu mới</h1>
                <ResetPasswordForm />
            </div>
        </div>
    );
}