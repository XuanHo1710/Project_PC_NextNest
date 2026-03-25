'use client'
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useEffect, useState } from "react";


export const AdminBodyLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const handler = () => { if (mq.matches) setMobileOpen(false); };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                {/* Body */}
                <div className="flex pt-16 md:pt-20 flex-1 overflow-y-hidden h-screen">
                    {/* Desktop sidebar */}
                    <div className="hidden md:block">
                        <Sidebar collapsed={collapsed} />
                    </div>

                    {/* Mobile sidebar overlay */}
                    {mobileOpen && (
                        <div className="md:hidden fixed inset-0 z-40 flex">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                            <div className="relative z-50 w-64 bg-white shadow-2xl h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                                <Sidebar collapsed={false} />
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-scroll grow bg-slate-50" style={{ scrollbarWidth: "none" }}>
                        <div className="px-3 md:px-5 py-4">
                            {children}
                        </div>
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    )

}