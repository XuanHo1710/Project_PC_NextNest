"use client";

import { Button } from "antd";

export default function NotFoundPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-yellow-700 text-gray-100 font-['Roboto']" style={{ fontFamily: "'Roboto', sans-serif" }}>
            {/* Cloak effect */}
            <div className="fixed inset-0 overflow-hidden z-0 cloak__wrapper pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cloak__container w-[250vmax] h-[250vmax]">
                    <div className="cloak w-full h-full" style={{
                        background: "radial-gradient(40% 40% at 50% 42%, transparent, black 35%)",
                        animation: "swing 2s infinite alternate-reverse ease-in-out",
                        transformOrigin: "50% 30%"
                    }} />
                </div>
            </div>

            {/* 404 Header */}
            <h1 className="relative z-10 font-['Open_Sans'] font-extrabold text-[clamp(5rem,40vmin,20rem)] mb-4 tracking-[1rem] animate-swing bg-gradient-to-b from-yellow-100 to-yellow-700 bg-clip-text text-transparent select-none">
                404
                <span className="absolute top-0 left-0 text-black opacity-30 blur-[1.5vmin] scale-[1.05] translate-y-[12%] -z-10">404</span>
            </h1>

            {/* Info Section */}
            <div className="info relative z-10 text-center max-w-[clamp(16rem,90vmin,25rem)] leading-relaxed">
                <h2 className="text-2xl font-bold mb-2">We can&apos;t find that page</h2>
                <p className="font-light mb-8">
                    We&apos;re fairly sure that page used to be here, but seems to have gone missing. We do apologise on its behalf.
                </p>
                <Button type="primary" size="large" href="/" className="uppercase rounded-full px-8 py-4 text-base tracking-wide shadow-md" style={{ background: "hsl(44, 0%, 70%)", color: "hsl(0, 0%, 4%)", border: "none" }}>
                    Home
                </Button>
            </div>

            {/* Tailwind custom animation */}
            <style>{`
                    @keyframes swing {
                        0% { transform: rotate(-5deg); }
                        50% { transform: rotate(0deg); }
                        100% { transform: rotate(5deg); }
                    }
                    .animate-swing { animation: swing 2s infinite alternate ease-in-out; }
                `}</style>
        </div>
    );
}
