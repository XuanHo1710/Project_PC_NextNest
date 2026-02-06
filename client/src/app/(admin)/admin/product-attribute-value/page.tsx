import ContentProductAttributeValue from "@/components/Content/ContentProductAttributeValue";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Giá trị thuộc tính',
    description: 'Quản lý giá trị thuộc tính sản phẩm',
};

export default function ProductAttributeValuePage() {
    return (
        <div className="py-2">
            <ContentProductAttributeValue />
        </div>
    );
}
