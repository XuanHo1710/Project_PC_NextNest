'use client'
import { Switch } from 'antd';

export default function ConfigModalAccountGuest({ ConfigFields }: { ConfigFields: { fields: Array<string>, setFields: React.Dispatch<React.SetStateAction<Array<string>>> } }) {

    const handleSwitch = (field: string, isActive: boolean) => {
        if (isActive) {
            ConfigFields.setFields((prev) => [...prev, field]);
        } else {
            ConfigFields.setFields((prev) => prev.filter((item) => item !== field));
        }
    }

    // Các field theo đúng entity AccountGuest
    const fieldConfigs = [
        { key: "avatar", label: "Ảnh đại diện" },
        { key: "fullname", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Số điện thoại" },
        { key: "accountStatus", label: "Trạng thái" },
        { key: "authProvider", label: "Đăng nhập qua" },
        { key: "gender", label: "Giới tính" },
        { key: "isEmailVerified", label: "Email xác thực" },
        { key: "totalOrders", label: "Tổng đơn hàng" },
        { key: "totalSpent", label: "Tổng chi tiêu" },
        { key: "loyaltyPoints", label: "Điểm tích lũy" },
    ];

    return (
        <>
            <div className='grid grid-cols-12 gap-4 grid-flow-row'>
                {fieldConfigs.map((field) => (
                    <div key={field.key} className='col-span-12 sm:col-span-6 p-4 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                        <h2 className='text-base font-semibold'>{field.label}:</h2>
                        <Switch
                            defaultChecked={ConfigFields.fields.includes(field.key)}
                            onClick={(isActive) => handleSwitch(field.key, isActive)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
