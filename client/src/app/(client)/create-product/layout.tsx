'use client';

import ProductSidebar from "@/components/client/CreateProduct/ProductSidebar";

export default function CreateProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-[1400px] mx-auto p-4">
            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-[260px] shrink-0 hidden md:block">
                    <div className="sticky top-32">
                        <ProductSidebar />
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
