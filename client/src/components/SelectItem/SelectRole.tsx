'use client'
import { GroupCollapse } from "@/components/GroupCollapse/GroupCollapse";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { IRole, useRoleStore } from "@/stores/roleStore";
import { Select } from "antd";
import { useEffect, useState } from "react";





export default function SelectRole() {
    const { accountLogin } = useAuthEmployee();
    const { fetchRoles, roles, getRoleById } = useRoleStore();
    const [roleSelected, setRoleSelected] = useState<IRole | null>(null);
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);
    const handleChangeRole = async (id: string) => {
        const role = await getRoleById(id);
        setRoleSelected(role);
    }
    return (
        <>
            {accountLogin && accountLogin.role.permission.some(
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
                            <GroupCollapse roleSelected={roleSelected} />
                        </div>
                    </div>
                </>
                :
                <h1 className="py-5 text-center font-semibold text-xl">U can not access this page</h1>
            }
        </>
    );
}
