'use client'
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { useState } from "react";


export const AdminBodyLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <>
            <Header collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="pt-20 flex overflow-y-hidden h-screen">
                <Sidebar collapsed={collapsed} ></Sidebar>
                <div className="overflow-y-scroll grow bg-slate-50" style={{ scrollbarWidth: "none" }}>
                    <div className='px-5'>
                        {children}
                    </div>
                    <Footer></Footer>
                </div>
            </div>
        </>
    )

}