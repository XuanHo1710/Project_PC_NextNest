'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Instantly scrolls to top on every client-side navigation (no smooth scroll).
 * Place this component inside any layout to apply to all its child routes.
 */
export default function ScrollToTop() {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
