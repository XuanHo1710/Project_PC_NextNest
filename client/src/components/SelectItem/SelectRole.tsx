'use client'
import { GroupCollapse } from "@/components/GroupCollapse/GroupCollapse";
import { Select } from "antd";





export default function SelectRole() {
    return (
        <>

            <div className="my-4 flex items-center">
                <h2 className="mx-2 font-semibold text-md">Vai trò: </h2>
                <Select style={{ width: 200 }} defaultValue="Vui lòng chọn quyền" >
                    <Select.Option value="HR">HR</Select.Option>
                    <Select.Option value="Development">Development</Select.Option>
                    <Select.Option value="Employee">Employee</Select.Option>
                </Select>
            </div>

            <div className="bg-slate-50 shadow-xl py-5 px-3 my-10 rounded-2xl">
                <h2 className="pb-2 border-b-2 border-solid border-slate-300">Danh sách các quyền:</h2>
                <div className="my-4">
                    <GroupCollapse />
                </div>

            </div>

        </>
    );
}
