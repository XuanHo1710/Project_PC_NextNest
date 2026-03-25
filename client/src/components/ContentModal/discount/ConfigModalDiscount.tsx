'use client'
import { Switch } from 'antd';


export default function ConfigModalDiscount({ ConfigFields }: { ConfigFields: { fields: Array<string>, setFields: React.Dispatch<React.SetStateAction<Array<string>>> } }) {

    const handleSwitch = (field: string, isActive: boolean) => {
        if (isActive) {
            ConfigFields.setFields((prev) => [...prev, field]);
        } else {
            ConfigFields.setFields((prev) => prev.filter((item) => item !== field));
        }
    }

    return (
        <>
            <div className='grid grid-cols-12 gap-4 sm:gap-10 grid-flow-row'>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Name:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("name")}
                        onClick={(isActive) => handleSwitch("name", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Description:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("description")}
                        onClick={(isActive) => handleSwitch("description", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Status:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("status")}
                        onClick={(isActive) => handleSwitch("status", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Type:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("type")}
                        onClick={(isActive) => handleSwitch("type", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Start Date:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("startDate")}
                        onClick={(isActive) => handleSwitch("startDate", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>End Date:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("endDate")}
                        onClick={(isActive) => handleSwitch("endDate", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Value Discount:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("valueDiscount")}
                        onClick={(isActive) => handleSwitch("valueDiscount", isActive)}
                    />
                </div>
            </div>
        </>
    );
}
