'use client';

import { Button, Form, Input } from "antd";
import { useState } from "react";
import { useQueryParams } from "../../hooks/QueryParamsContext";

const FilterEmployee = () => {

    const [selectedGender, setSelectedGender] = useState("all");
    const { queryParams, setQueryParams } = useQueryParams();


    const genders = [
        { label: "Tất cả", value: "all" },
        { label: "Giới tính nam", value: "gender_Nam" },
        { label: "Giới tính nữ", value: "gender_Nữ" },
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

        setSelectedGender(value);
    }

    return (
        <>
            <div className="shadow-inner my-5 bg-slate-50 py-2 px-2 rounded-xl">
                <h2 className='py-2 text-lg font-sans px-2 border-slate-200 border-b-2 border-solid'>Bộ lọc và tìm kiếm</h2>
                <div className='flex mt-4 items-center justify-between'>
                    <div className="flex items-center justify-center ">
                        <h3 className="mx-2">Trạng thái: </h3>
                        {genders.map(g => (
                            <Button
                                key={g.value}
                                color="green"
                                variant={selectedGender === g.value ? "solid" : "outlined"} // ✅ đổi màu theo trạng thái
                                className={`mx-1 !font-bold`}
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

export default FilterEmployee;