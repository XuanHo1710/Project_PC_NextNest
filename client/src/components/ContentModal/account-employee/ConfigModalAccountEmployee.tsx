'use client'
import { Switch } from 'antd';


export default function ConfigModalAccountEmployee({ ConfigFields }: { ConfigFields: { fields: Array<string>, setFields: React.Dispatch<React.SetStateAction<Array<string>>> } }) {

    const handleSwitch = (field: string, isActive: boolean) => {
        if (isActive) {
            ConfigFields.setFields((prev) => [...prev, field]);
        } else {
            ConfigFields.setFields((prev) => prev.filter((item) => item !== field));
        }
    }

    // Các field theo đúng entity AccountEmployee
    const fieldConfigs = [
        { key: "IDEmp", label: "Mã nhân viên" },
        { key: "avatar", label: "Ảnh đại diện" },
        { key: "name", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "age", label: "Tuổi" },
        { key: "gender", label: "Giới tính" },
        { key: "status", label: "Trạng thái" },
        { key: "roleId", label: "Vai trò" },
    ];

    return (
        <>
            <div className='grid grid-cols-12 gap-4 grid-flow-row'>
                {fieldConfigs.map((field) => (
                    <div key={field.key} className='col-span-6 p-4 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
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
