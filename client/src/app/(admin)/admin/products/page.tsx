import ContentProduct from "@/components/Content/ContentProduct";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Trang sản phẩm'
};
export default function Product() {
    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang sản phẩm</h2>
                <ContentProduct />
            </div>
        </>
    );
}
