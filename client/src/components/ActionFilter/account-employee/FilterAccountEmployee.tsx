'use client';

import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Button, Form, Input, Select } from "antd";
import { useState } from "react";
import { useRoles } from "@/hooks/admin";

const FilterAccountEmployee = () => {

    const [selectedStatus, setSelectedStatus] = useState("all");
    const { queryParams, setQueryParams } = useQueryParams();

    // Theo entity AccountEmployee: status có các giá trị ACTIVE, INACTIVE
    const statusTypes = [
        { label: "Tất cả", value: "all" },
        { label: "Hoạt động", value: "ACTIVE" },
        { label: "Dừng hoạt động", value: "INACTIVE" },
    ];

    const { data: rolesData } = useRoles();
    const roles = rolesData?.data ?? [];


    const handleSearch = (values: { search: string }) => {
        const keyword = values.search?.trim() || "";
        const currentParams = new URLSearchParams(queryParams.toString());

        if (keyword !== "") {
            currentParams.set("search", keyword);
        } else {
            currentParams.delete("search");
        }
        setQueryParams(currentParams);
    }


    const handleChangeRole = (roleId: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (roleId !== "all") {
            // Backend expects: filter=roleId_<value>
            currentParams.set("filter", "roleId_" + roleId);
        } else {
            currentParams.delete("filter");
        }
        setQueryParams(currentParams);
    }

    const handleFilterStatus = (value: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (value !== "all") {
            // Backend expects: filter=status_<value>
            currentParams.set("filter", "status_" + value);
        } else {
            currentParams.delete("filter");
        }

        setQueryParams(currentParams);
        setSelectedStatus(value);
    }

    return (
        <>
            <div className="my-5 bg-white py-2 px-2 rounded-lg border-[1px] border-solid border-slate-200">
                <h2 className='py-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Bộ lọc và tìm kiếm</h2>
                <div className='flex mt-4 items-center justify-between flex-wrap gap-4'>
                    {/* Filter by status */}
                    <div className="flex items-center justify-center ">
                        <h3 className="mx-2 text-sm">Trạng thái: </h3>
                        {statusTypes.map(t => (
                            <Button
                                key={t.value}
                                color="blue"
                                variant={selectedStatus === t.value ? "solid" : "outlined"}
                                className="mx-1"
                                onClick={() => handleFilterStatus(t.value)}
                            >
                                {t.label}
                            </Button>
                        ))}
                    </div>

                    {/* Filter by role */}
                    <div className="flex items-center justify-center ">
                        <h3 className="mx-2 text-sm">Vai trò: </h3>
                        <Select className="w-60" placeholder="Chọn vai trò" onChange={handleChangeRole} defaultValue="all">
                            <Select.Option value="all">Tất cả</Select.Option>
                            {roles.length > 0 &&
                                roles.map(r => (
                                    <Select.Option key={r._id} value={r._id}>{r.name}</Select.Option>
                                ))
                            }
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="flex items-center justify-center">
                        <Form onFinish={handleSearch}>
                            <Form.Item name="search" className='!m-0' label="Tìm kiếm">
                                <Input.Search allowClear className='!w-full' placeholder="Mã NV, tên, email" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FilterAccountEmployee;