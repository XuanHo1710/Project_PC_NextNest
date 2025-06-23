'use client';
import { useEffect } from 'react';
import axios from 'axios';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';


export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setAccountLogin, setAccessToken } = useAuthEmployee();

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.post('/api/admin/auth/token', {});
                const resGetToken = await axios.get('/api/admin/auth/token');
                setAccountLogin(res.data);
                setAccessToken(resGetToken.data.accessToken)
            } catch (err) {
                console.log('Auth error, resetting auth', err);
                await axios.post("/api/admin/auth/token/delete", { id: "" });
                setAccountLogin(null);
                setAccessToken("");
                window.location.href = "/auth/login";
            }
        };

        fetchAccount();
    }, [setAccountLogin, setAccessToken]);

    return <>{children}</>;
}
