'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { accountService } from '../services/client/account.service';
import { ILoginResponse, IRegisterDto } from '../types/account';
import { message } from 'antd';

type User = ILoginResponse['user'];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (registerData: IRegisterDto) => Promise<boolean>;
    logout: () => Promise<void>;
    loginWithGoogle: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper functions for localStorage
    const setStoredUser = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const getStoredUser = (): User | null => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    };

    const removeStoredUser = () => {
        localStorage.removeItem('user');
    };

    const handleGoogleAuthSuccess = React.useCallback(async () => {
        try {
            const profile = await accountService.getCurrentUser();
            setUser(profile);
            setStoredUser(profile);
            message.success('Đăng nhập Google thành công!');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error getting profile after Google auth:', error);
            message.error('Có lỗi xảy ra khi đăng nhập Google');
        }
    }, []);

    useEffect(() => {
        // Check if user is stored in localStorage
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);

        // Check URL for Google auth success (only on success page)
        if (window.location.pathname === '/auth/success') {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                handleGoogleAuthSuccess();
            }
        }
    }, [handleGoogleAuthSuccess]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await accountService.login({ email, password });
            setUser(response.user);
            setStoredUser(response.user);
            message.success('Đăng nhập thành công!');
            return true;
        } catch (error: unknown) {
            console.error('Login error:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng nhập thất bại';
            message.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (registerData: IRegisterDto): Promise<boolean> => {
        try {
            setLoading(true);
            await accountService.register(registerData);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            return true;
        } catch (error: unknown) {
            console.error('Register error:', error);
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại';
            message.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await accountService.logout();
            setUser(null);
            removeStoredUser();
            message.success('Đăng xuất thành công!');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
            removeStoredUser();
        }
    };

    const loginWithGoogle = (): void => {
        accountService.googleLogin();
    };

    const refreshAuth = async (): Promise<void> => {
        try {
            const profile = await accountService.getCurrentUser();
            setUser(profile);
            setStoredUser(profile);
        } catch (error) {
            console.error('Refresh auth error:', error);
            // If refresh fails, clear user data
            setUser(null);
            removeStoredUser();
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle,
        refreshAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}