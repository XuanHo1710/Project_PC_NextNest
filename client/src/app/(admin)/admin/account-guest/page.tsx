import ContentAccountGuest from "@/components/Content/ContentAccountGuest";


import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Tài khoản khách hàng'
};

export default function AccountGuest() {

    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang tài khoản khách hàng</h2>
                <ContentAccountGuest />
            </div>
        </>
    );
}
