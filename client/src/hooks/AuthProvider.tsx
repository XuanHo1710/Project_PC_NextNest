'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { IAccountLogin } from '@/types/account-employee';
import { pathAdminRoutes } from '@/config/route';
import { useRouter } from 'next/navigation';
import { roleService } from '@/services/admin/role.service';


export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAccountLogin, setAccessToken, resetAuth } = useAuthEmployee();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.post('/api/admin/auth/profile', {});
                if (res.data !== null && res.data.data) {
                    console.log(res)
                    // Store access_token in Zustand so admin axios can attach it as Bearer token
                    if (res.data.data.access_token) {
                        setAccessToken(res.data.data.access_token);
                    }
                    const { user } = res.data.data;

                    const role = await roleService.getById(user.roleId, {
                        headers: {
                            Authorization: `Bearer ${res.data.data.access_token}`,
                        },
                    });

                    console.log(role)

                    setAccountLogin({
                        IDEmp: user.IDEmp,
                        username: user.username,
                        employeeId: user.employeeId,
                        roleId: user.roleId,
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
    }, [setAccountLogin, setAccessToken, resetAuth, router]);

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
