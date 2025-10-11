'use client'
import { GroupCollapse } from "@/components/GroupCollapse/GroupCollapse";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { Select } from "antd";
import { useState } from "react";
import { useRoles, useRole } from "@/hooks/admin";

export default function SelectRole() {
    const { accountLogin } = useAuthEmployee();
    const { data: roles = [] } = useRoles();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("");
    const { data: roleSelected } = useRole(selectedRoleId);

    const handleChangeRole = (id: string) => {
        setSelectedRoleId(id);
    }
    return (
        <>
            {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                (p) => p.method === "PATCH" && p.path === "/api/v1/admin/role/:id"
            ) ?
                <>
                    <div className="my-4 flex items-center">
                        <h2 className="mx-2 font-semibold text-md">Vai trò: </h2>
                        <Select onChange={handleChangeRole} style={{ width: 200 }} placeholder="Vui lòng chọn quyền" >
                            {roles.length > 0 &&
                                roles.map(role => (
                                    <Select.Option key={role._id} value={role._id}>{role.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </div>

                    <div className="bg-slate-50 shadow-xl py-5 px-3 my-10 rounded-2xl">
                        <h2 className="pb-2 border-b-2 border-solid border-slate-300">Danh sách các quyền:</h2>
                        <div className="my-4">
                            <GroupCollapse roleSelected={roleSelected || null} />
                        </div>
                    </div>
                </>
                :
                <h1 className="py-5 text-center font-semibold text-xl">U can not access this page</h1>
            }
        </>
    );
}
