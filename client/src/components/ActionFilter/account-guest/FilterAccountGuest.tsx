'use client';

import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Button, Form, Input } from "antd";
import { useState } from "react";

const FilterAccountGuest = () => {

    const [selectedType, setSelectedType] = useState("all");
    const { queryParams, setQueryParams } = useQueryParams();


    const types = [
        { label: "Tất cả", value: "all" },
        { label: "Chờ xác thực", value: "accountStatus_PENDING" },
        { label: "Hoạt động", value: "accountStatus_ACTIVE" },
        { label: "Dừng hoạt động", value: "accountStatus_SUSPENDED" },
        { label: "Đã xóa", value: "accountStatus_DELETED" },
    ];


    const handleSearch = (values: { search: string }) => {
        const keyword = values.search.trim();
        if (keyword !== "") {
            const currentParams = new URLSearchParams(queryParams.toString());
            currentParams.set("search", keyword);
            setQueryParams(currentParams);

        } else {
            const currentParams = new URLSearchParams(queryParams.toString());
            currentParams.delete("search");
            setQueryParams(currentParams);
        }

    }

    const handleFilter = (value: string) => {
        if (value !== "all") {
            // Lấy các tham số hiện tại từ queryParams
            const currentParams = new URLSearchParams(queryParams.toString());

            // Cập nhật filter, nhưng giữ các tham số khác
            currentParams.set("filter", value);

            // Cập nhật lại queryParams
            setQueryParams(currentParams);

        } else {
            const currentParams = new URLSearchParams(queryParams.toString());
            currentParams.delete("filter"); // ✅ Xoá key sort nếu là "all"
            setQueryParams(currentParams);
        }

        setSelectedType(value);
    }

    return (
        <>
            <div className="my-5 bg-white py-2 px-2 rounded-lg border-[1px] border-solid border-slate-200">
                <h2 className='py-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Bộ lọc và tìm kiếm</h2>
                <div className='flex mt-4 items-center justify-between'>
                    <div className="flex items-center justify-center ">
                        <h3 className="mx-2 text-sm">Trạng thái: </h3>
                        {types.map(g => (
                            <Button
                                key={g.value}
                                color="blue"
                                variant={selectedType === g.value ? "solid" : "outlined"} // ✅ đổi màu theo trạng thái
                                className={`mx-1 `}
                                onClick={() => handleFilter(g.value)}
                            >
                                {g.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center justify-center">
                        <Form onFinish={handleSearch}>
                            <Form.Item name="search" className='!m-0' label="Tìm kiếm">
                                <Input.Search allowClear className='!w-full' placeholder="Nhập từ khóa tìm kiếm" />
                            </Form.Item>
                        </Form>
                    </div>
                </div>

            </div>
        </>
    )
}

export default FilterAccountGuest;