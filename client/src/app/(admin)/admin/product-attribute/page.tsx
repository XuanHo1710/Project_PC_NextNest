import ContentProductAttribute from "@/components/Content/ContentProductAttribute";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Thuộc tính sản phẩm',
    description: 'Quản lý thuộc tính sản phẩm',
};

export default function ProductAttributePage() {
    return (
        <div className="py-2">
            <ContentProductAttribute />
        </div>
    );
}
