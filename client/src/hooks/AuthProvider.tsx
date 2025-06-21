'use client';
import { useEffect } from 'react';
import axios from 'axios';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';


export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAccountLogin } = useAuthEmployee();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.post('/api/admin/auth/token', {});
                setAccountLogin(res.data);
            } catch (err) {
                console.log('Auth error, resetting auth', err);
                window.location.href = "/auth/login"
            }
        };

        fetchAccount();
    }, [setAccountLogin]);

    return <>{children}</>;
}
