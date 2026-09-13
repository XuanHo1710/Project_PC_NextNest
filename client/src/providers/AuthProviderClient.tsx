'use client';

import React, { useEffect, ReactNode, useState, createContext, useContext } from 'react';
import useAuthUser from '@/hooks/useAuthUser';
import { IClientUser } from '@/types/auth';
import axiosClient from '@/config/axiosClient';
import { hasSessionHint } from '@/utils/sessionFlag';

interface AuthContextType {
    user: IClientUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        const store = useAuthUser();
        return {
            user: store.user,
            loading: store.loading,
            isAuthenticated: store.isAuthenticated,
            login: store.login,
            logout: store.logout,
            loginWithGoogle: store.loginWithGoogle,
        };
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

function mapUser(raw: Record<string, unknown>): IClientUser {
    const userData = raw as Record<string, any>;
    return {
        _id: userData._id,
        id: userData._id,
        email: userData.email,
        fullname: userData.fullname,
        avatar: userData.avatar,
        authProvider: userData.authProvider,
        accountStatus: userData.accountStatus,
        isEmailVerified: userData.isEmailVerified,
        phone: userData.phone,
        gender: userData.gender,
    } as IClientUser;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, resetAuth, user, loading, isAuthenticated, login, logout, loginWithGoogle, handleGoogleCallback } = useAuthUser();
    const [isLoading, setIsLoading] = useState(true);

    // Listen for Google OAuth popup postMessage.
    // The gateway callback already set cookies on the API domain; the popup
    // only carries the public profile payload (no tokens).
    useEffect(() => {
        const handleGoogleMessage = async (event: MessageEvent) => {
            // Extract origin only from the full API URL (e.g. http://localhost:8080/api/v1 → http://localhost:8080)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const allowedOrigin = new URL(apiUrl).origin;
            if (event.origin !== allowedOrigin) return;

            if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
                await handleGoogleCallback(event.data.payload);
            } else if (event.data?.type === 'GOOGLE_LOGIN_FAILED') {
                import('antd').then(({ message: antMessage }) => {
                    antMessage.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
                });
            }
        };

        window.addEventListener('message', handleGoogleMessage);
        return () => window.removeEventListener('message', handleGoogleMessage);
    }, [handleGoogleCallback]);

    useEffect(() => {
        const fetchProfile = async () => {
            // Auth cookies are httpOnly — we can't read them from JS.
            // Skip bootstrap entirely for guests who never logged in on this
            // browser to avoid 401 -> refresh(400) noise on first visit.
            if (!hasSessionHint()) {
                setIsLoading(false);
                return;
            }
            try {
                // Authenticated via client_access_token httpOnly cookie.
                // If expired, axiosClient interceptor rotates it via /auth/refresh automatically.
                const res: any = await axiosClient.get('/account-guest/profile-detail');
                const userData = res?.data;
                if (userData?._id) {
                    setUser(mapUser(userData));
                } else {
                    resetAuth();
                }
            } catch {
                // 401 after refresh attempt means session is truly gone
                resetAuth();
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [setUser, resetAuth]);

    const contextValue: AuthContextType = {
        user,
        loading: loading || isLoading,
        isAuthenticated,
        login,
        logout,
        loginWithGoogle,
    };

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
