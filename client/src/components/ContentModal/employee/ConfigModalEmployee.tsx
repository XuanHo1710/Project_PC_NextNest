'use client'
import { Switch } from '@/components/ui/switch';
import '@ant-design/v5-patch-for-react-19';

// import type { SwitchRef } from 'antd/es/switch';


export default function ConfigModalEmployee({ ConfigFields }: { ConfigFields: { fields: Array<string>, setFields: React.Dispatch<React.SetStateAction<Array<string>>> } }) {

    const handleSwitch = (field: string, isActive: boolean) => {
        if (isActive) {
            ConfigFields.setFields((prev) => [...prev, field]);
        } else {
            ConfigFields.setFields((prev) => prev.filter((item) => item !== field));
        }
    }

    return (
        <>
            <div className='grid grid-cols-12 gap-10 grid-flow-row'>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Name:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("name")}
                        onCheckedChange={(isActive) => handleSwitch("name", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Age:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("age")}
                        onCheckedChange={(isActive) => handleSwitch("age", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Gender:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("gender")}
                        onCheckedChange={(isActive) => handleSwitch("gender", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Address:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("address")}
                        onCheckedChange={(isActive) => handleSwitch("address", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Email:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("email")}
                        onCheckedChange={(isActive) => handleSwitch("email", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Role:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("role")}
                        onCheckedChange={(isActive) => handleSwitch("role", isActive)}
                    />
                </div>
            </div>
        </>
    );
}
