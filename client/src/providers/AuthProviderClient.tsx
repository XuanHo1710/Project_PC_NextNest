'use client';

import React, { useEffect, ReactNode, useState, createContext, useContext } from 'react';
import useAuthUser from '@/hooks/useAuthUser';
import axios from 'axios';
import { IClientUser } from '@/types/auth';

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

export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setAccessToken, resetAuth, user, loading, isAuthenticated, login, logout, loginWithGoogle, handleGoogleCallback } = useAuthUser();
    const [isLoading, setIsLoading] = useState(true);

    // Listen for Google OAuth popup postMessage
    useEffect(() => {
        const handleGoogleMessage = async (event: MessageEvent) => {
            // Extract origin only from the full API URL (e.g. http://localhost:8080/api/v1 → http://localhost:8080)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const allowedOrigin = new URL(apiUrl).origin;
            if (event.origin !== allowedOrigin) return;

            if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
                const { access_token, payload } = event.data.payload;
                await handleGoogleCallback({ access_token, payload });
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
            try {
                // Next.js server reads client_access_token from httpOnly cookie
                const res = await axios.post('/api/client/auth/profile', {});

                if (res.data.success && res.data.data) {
                    const { user: userData, access_token } = res.data.data;
                    setUser({
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
                    });
                    // Store access_token in Zustand so axiosClient can attach it as Bearer token
                    if (access_token) {
                        setAccessToken(access_token);
                    }
                } else {
                    resetAuth();
                }
            } catch (err: unknown) {
                const axiosErr = err as { response?: { status?: number } };
                // If 401, try refresh token before giving up
                if (axiosErr.response?.status === 401) {
                    try {
                        const refreshRes = await axios.post('/api/client/auth/refresh', {});
                        if (refreshRes.data.success && refreshRes.data.data?.access_token) {
                            const payload = refreshRes.data.data.payload;
                            if (payload) {
                                setUser({
                                    _id: payload._id || payload.id,
                                    id: payload._id || payload.id,
                                    email: payload.email,
                                    fullname: payload.fullname,
                                    avatar: payload.avatar,
                                    authProvider: payload.authProvider,
                                    accountStatus: payload.accountStatus,
                                    isEmailVerified: payload.isEmailVerified,
                                    phone: payload.phone,
                                    gender: payload.gender,
                                });
                            }
                            setAccessToken(refreshRes.data.data.access_token);
                        } else {
                            resetAuth();
                        }
                    } catch {
                        resetAuth();
                    }
                } else {
                    resetAuth();
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [setUser, setAccessToken, resetAuth]);

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
