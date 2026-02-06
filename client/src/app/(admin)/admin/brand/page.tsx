import ContentBrand from "@/components/Content/ContentBrand";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Quản lý thương hiệu'
};

export default function Brand() {
    return (
        <>
            <div className="py-3">
                <h2 className="text-center text-2xl my-3 font-bold">Quản lý thương hiệu</h2>
                <ContentBrand />
            </div>
        </>
    );
}
