import ContentRole from "@/components/Content/ContentRole";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Trang vai trò của nhân viên'
};


export default function Role() {

    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang vai trò quyền</h2>
                <ContentRole />
            </div>
        </>
    );
}

