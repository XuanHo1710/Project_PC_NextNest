'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { IAccountLogin } from '@/types/account-employee';
import { pathAdminRoutes } from '@/config/route';
import { useRouter } from 'next/navigation';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';


export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAccountLogin, resetAuth } = useAuthEmployee();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                // Authenticated via admin_access_token httpOnly cookie (sent automatically).
                const res = await axios.get(`${API_BASE}/admin/auth/profile`, {
                    withCredentials: true,
                });
                if (res.data !== null && res.data.data) {
                    const user = res.data.data.user ?? res.data.data;

                    setAccountLogin({
                        _id: user._id,
                        IDEmp: user.IDEmp,
                        username: user.username,
                        employeeId: user.employeeId,
                        roleId: user.roleId,
                        avatar: user.avatar || '',
                        role: user.role,
                    } as IAccountLogin);
                } else {
                    resetAuth();
                    router.replace(pathAdminRoutes.login);
                }
            } catch (err) {
                console.error('Auth error, resetting auth', err);
                resetAuth();
                // Only redirect if we're not already on login page
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
                    router.replace(pathAdminRoutes.login);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, [setAccountLogin, resetAuth, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
                <span className="text-3xl font-semibold text-[#1677ff]">
                    Đang kiểm tra phiên đăng nhập...
                </span>
                <div className="w-[250px]">
                    <div className="relative h-2 w-full rounded bg-gray-200 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full animate-progress bg-[#1677ff]" />
                    </div>
                </div>
            </div>

        )
    }


    return <>{children}</>;
}
