'use client';

import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Button, Form, Input, Select } from "antd";
import { useState } from "react";

const FilterAccountGuest = () => {

    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedProvider, setSelectedProvider] = useState("all");
    const { queryParams, setQueryParams } = useQueryParams();

    // Theo entity AccountGuest: accountStatus có các giá trị PENDING, ACTIVE, SUSPENDED, DELETED
    const statusTypes = [
        { label: "Tất cả", value: "all" },
        { label: "Chờ xác thực", value: "PENDING" },
        { label: "Hoạt động", value: "ACTIVE" },
        { label: "Đã khóa", value: "SUSPENDED" },
        { label: "Đã xóa", value: "DELETED" },
    ];

    // Theo entity AccountGuest: authProvider có các giá trị local, google
    const providerTypes = [
        { label: "Tất cả", value: "all" },
        { label: "Email", value: "local" },
        { label: "Google", value: "google" },
    ];

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

    const handleFilterStatus = (value: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (value !== "all") {
            currentParams.set("accountStatus", value);
        } else {
            currentParams.delete("accountStatus");
        }

        setQueryParams(currentParams);
        setSelectedStatus(value);
    }

    const handleFilterProvider = (value: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (value !== "all") {
            currentParams.set("authProvider", value);
        } else {
            currentParams.delete("authProvider");
        }

        setQueryParams(currentParams);
        setSelectedProvider(value);
    }

    return (
        <>
            <div className="my-5 bg-white py-2 px-2 rounded-lg border-[1px] border-solid border-slate-200">
                <h2 className='py-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Bộ lọc và tìm kiếm</h2>
                <div className='flex mt-4 items-center justify-between flex-wrap gap-4'>
                    {/* Filter by status */}
                    <div className="flex items-center justify-center">
                        <h3 className="mx-2 text-sm">Trạng thái: </h3>
                        {statusTypes.map(s => (
                            <Button
                                key={s.value}
                                color="blue"
                                variant={selectedStatus === s.value ? "solid" : "outlined"}
                                className="mx-1"
                                onClick={() => handleFilterStatus(s.value)}
                            >
                                {s.label}
                            </Button>
                        ))}
                    </div>

                    {/* Filter by auth provider */}
                    <div className="flex items-center justify-center">
                        <h3 className="mx-2 text-sm">Đăng nhập qua: </h3>
                        <Select
                            className="w-40"
                            value={selectedProvider}
                            onChange={handleFilterProvider}
                        >
                            {providerTypes.map(p => (
                                <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>
                            ))}
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="flex items-center justify-center">
                        <Form onFinish={handleSearch}>
                            <Form.Item name="search" className='!m-0' label="Tìm kiếm">
                                <Input.Search allowClear className='!w-full' placeholder="Họ tên, email, SĐT" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FilterAccountGuest;