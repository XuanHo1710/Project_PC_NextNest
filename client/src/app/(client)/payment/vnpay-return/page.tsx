'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Legacy VNPay return page - redirects to /payment/info
 */
export default function VnpayReturnPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        router.replace(`/payment/info?${searchParams.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Dang chuyen huong...</p>
        </div>
    );
}
