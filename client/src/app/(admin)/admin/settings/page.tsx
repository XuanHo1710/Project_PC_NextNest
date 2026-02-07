import ContentSettings from "@/components/Content/ContentSettings";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Cài đặt hệ thống',
    description: 'Quản lý cài đặt hệ thống admin'
};

export default function SettingsPage() {
    return (
        <>
            <ContentSettings />
        </>
    );
}
