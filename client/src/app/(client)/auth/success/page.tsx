'use client';

import { useEffect } from 'react';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                // Wait a bit for the cookies to be set
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Redirect to home
                router.push('/home');
            } catch (error) {
                console.error('Auth success error:', error);
                router.push('/auth?error=google_auth_failed');
            }
        };

        handleAuthSuccess();
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <Spin size="large" className="mb-4" />
                <h2 className="text-xl font-semibold mb-2">Äang xá»­ lÃ½ Ä‘Äƒng nháº­p...</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Vui lÃ²ng chá» trong giÃ¢y lÃ¡t
                </p>
            </div>
        </div>
    );
}