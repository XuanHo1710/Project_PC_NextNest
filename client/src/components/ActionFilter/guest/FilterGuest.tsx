'use client';

import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Form, Input } from "antd";

const FilterGuest = () => {
    const { queryParams, setQueryParams } = useQueryParams();


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

    return (
        <>
            <div className="my-5 bg-white py-2 px-2 rounded-lg border-[1px] border-solid border-slate-200">
                <h2 className='py-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Tìm kiếm</h2>
                <div className='w-1/2 px-5 py-3'>

                    <Form onFinish={handleSearch}>
                        <Form.Item name="search" className='!m-0' label="Tìm kiếm">
                            <Input.Search allowClear className='!w-full' placeholder="Nhập từ khóa tìm kiếm" />
                        </Form.Item>
                    </Form>

                </div>

            </div>
        </>
    )
}

export default FilterGuest;