"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingPage from "@/app/loading-page";

export default function GlobalLoading({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 600); // fake delay cho mượt
        return () => clearTimeout(timeout);
    }, [pathname]);

    if (loading) {
        return <LoadingPage />;
    }

    return <>{children}</>;
}
