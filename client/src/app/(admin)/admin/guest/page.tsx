import ContentGuest from "@/components/Content/ContentGuest";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Trang khách hàng'
};

export default function Guest() {

    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang khách hàng</h2>
                <ContentGuest />
            </div>
        </>
    );
}
