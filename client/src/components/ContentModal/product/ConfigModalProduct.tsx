'use client'
import { Switch } from 'antd';


export default function ConfigModalProduct({ ConfigFields }: { ConfigFields: { fields: Array<string>, setFields: React.Dispatch<React.SetStateAction<Array<string>>> } }) {

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
                    <h2 className='text-base font-semibold'>Images:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("images")}
                        onClick={(isActive) => handleSwitch("images", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>OldPrice:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("oldPrice")}
                        onClick={(isActive) => handleSwitch("oldPrice", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Stock:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("stock")}
                        onClick={(isActive) => handleSwitch("stock", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>SoldCount:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("soldCount")}
                        onClick={(isActive) => handleSwitch("soldCount", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Category:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("category")}
                        onClick={(isActive) => handleSwitch("category", isActive)}
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
                    <h2 className='text-base font-semibold'>Position:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("position")}
                        onClick={(isActive) => handleSwitch("position", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Feature:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("feature")}
                        onClick={(isActive) => handleSwitch("feature", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>Discount:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("discount")}
                        onClick={(isActive) => handleSwitch("discount", isActive)}
                    />
                </div>
                <div className='col-span-12 sm:col-span-6 p-4 sm:p-5 flex items-center justify-between border-[1px] border-slate-100 rounded-lg'>
                    <h2 className='text-base font-semibold'>NewPrice:</h2>
                    <Switch
                        defaultChecked={ConfigFields.fields.includes("newPrice")}
                        onClick={(isActive) => handleSwitch("newPrice", isActive)}
                    />
                </div>
            </div>
        </>
    );
}
