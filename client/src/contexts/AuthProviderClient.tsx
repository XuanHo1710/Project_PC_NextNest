'use client';

import React, { useEffect, ReactNode } from 'react';
// import { ILoginResponse } from '../types/account';
import useAuthUser from '@/hooks/useAuthUser';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// type User = ILoginResponse['user'];


interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { setAccountLogin, setAccessToken, refreshAuth } = useAuthUser();
    const router = useRouter();
    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.post('/api/client/auth/token', {});
                if (res.data !== null && res.data.data) {
                    setAccountLogin({
                        id: res.data.data?.guestId,
                        email: res.data.data.email,
                        fullname: res.data.data.fullname,
                        avatar: res.data.data.avatar,
                        authProvider: res.data.data.authProvider,
                        accountStatus: res.data.data.avatar,
                        isEmailVerified: res.data.data.guestId,
                    });

                    setAccessToken(res.data.data.access_token);
                } else {
                    refreshAuth();
                    // window.location.href = pathAdminRoutes.login;
                    router.replace("/home");
                }
            } catch {
                refreshAuth();
            }
        };
        fetchAccount();
    }, [setAccountLogin, setAccessToken, refreshAuth, router]);

    return <>{children}</>;
}
