'use client';
import { IAccountEmployee } from '@/stores/accountEmployeeStore';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AuthContextValue {
    accessToken: string | null;
    accountLogin: IAccountEmployee | null;
    setAccessToken: (token: string) => void;
    setAccountLogin: (accountEmployee: IAccountEmployee | null) => void;
}

const AuthEmployeeContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthEmployeeProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string>("");
    const [accountLogin, setAccountLogin] = useState<IAccountEmployee | null>(null);

    useEffect(() => {
        console.log("Kiểm tra đều đều");

        if (!accountLogin?.refresh_token) return;

        const interval = setInterval(() => {
            console.log("Kiểm tra đều đều");

            try {
                const refreshData = jwtDecode(accountLogin?.refresh_token || "");
                const accessData = accessToken ? jwtDecode(accessToken) : null;

                const now = Math.floor(Date.now() / 1000);
                const refreshLeft = refreshData?.exp || 0 - now;

                if (refreshLeft < 86400 && refreshLeft > 0 && accessData?.exp && accessData?.exp > now) {
                    console.log(`[AuthEmployee] Refresh Token còn ${refreshLeft}s ➔ Gọi /auth/refresh...`);

                    axios.post("/api/admin/auth/refresh-token", {}, { withCredentials: true })
                        .then((res) => {
                            const { access_token, refresh_token } = res.data;

                            // Cập nhật access_token
                            setAccessToken(access_token);
                            setAccountLogin((prev) =>
                                prev ? { ...prev, refresh_token } : prev
                            );
                            console.log("[AuthEmployee] ✅ Refresh thành công");
                        })
                        .catch((error) => {
                            console.error("[AuthEmployee] Refresh thất bại:", error);
                            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
                            setAccessToken("");
                            setAccountLogin(null);
                        });
                }
            } catch (error) {
                console.error("[AuthEmployee] Lỗi khi parse JWT:", error);
            }
        }, 30_000); // Kiểm tra mỗi 30 giây
        return () => clearInterval(interval);
    }, [accountLogin]);

    return (
        <AuthEmployeeContext.Provider value={{ accessToken, setAccessToken, setAccountLogin, accountLogin }}>
            {children}
        </AuthEmployeeContext.Provider>
    );
};

export const useAuthEmployee = () => {
    const context = useContext(AuthEmployeeContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
