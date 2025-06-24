import ContentAccountEmployee from "@/components/Content/ContentAccountEmployee";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: 'Tài khoản nhân viên'
};

export default function AccountEmployee() {

    return (
        <>
            <div className="py-2">
                <h2 className="text-center text-2xl font-bold">Trang tài khoản nhân viên</h2>
                <ContentAccountEmployee />
            </div>
        </>
    );
}
