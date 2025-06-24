import ContentDiscount from "@/components/Content/ContentDiscount";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Khuyến mãi'
};
export default function Discount() {
    return (
        <>

            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang khuyến mãi</h2>
                <ContentDiscount />
            </div>
        </>
    );
}

