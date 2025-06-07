'use client'
import '@ant-design/v5-patch-for-react-19';
import { Switch } from 'antd';


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
                        onClick={(isActive) => handleSwitch("name", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Age:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("age")}
                        onClick={(isActive) => handleSwitch("age", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Gender:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("gender")}
                        onClick={(isActive) => handleSwitch("gender", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Address:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("address")}
                        onClick={(isActive) => handleSwitch("address", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Email:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("email")}
                        onClick={(isActive) => handleSwitch("email", isActive)}
                    />
                </div>
                <div className='col-span-6 p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Role:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("role")}
                        onClick={(isActive) => handleSwitch("role", isActive)}
                    />
                </div>
            </div>
        </>
    );
}
