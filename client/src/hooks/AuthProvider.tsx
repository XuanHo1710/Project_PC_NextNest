'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { IAccountLogin } from '@/types/account-employee';
import { pathAdminRoutes } from '@/config/route';
import { useRouter } from 'next/navigation';
import { roleService } from '@/services/admin/role.service';



export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAccountLogin, resetAuth } = useAuthEmployee();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.post('/api/admin/auth/token', {});
                if (res.data !== null && res.data.data) {
                    const role = await roleService.getById(res.data.data.roleId);
                    setAccountLogin({
                        IDEmp: res.data.data.IDEmp,
                        username: res.data.data.username,
                        employeeId: res.data.data.employeeId,
                        roleId: res.data.data.roleId,
                        role,
                    } as IAccountLogin);
                } else {
                    resetAuth();
                    router.replace(pathAdminRoutes.login);
                }
            } catch (err) {
                console.error('Auth error, resetting auth', err);
                resetAuth();
                router.replace(pathAdminRoutes.login);
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
