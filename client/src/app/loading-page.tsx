"use client";

import { Image } from "antd";

export default function LoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {/* Logo */}
            <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/ASUS_Corporate_Logo.svg/1280px-ASUS_Corporate_Logo.svg.png"
                        alt="Logo"
                        className="w-full"
                    />
                    {/* Vòng xoay */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-12">from MyCompany</p>
            </div>
        </div>
    );
}
