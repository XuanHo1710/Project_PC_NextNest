'use client'

import { useSelectedRowsCategory } from "@/app/(admin)/admin/category/page";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { useEmployeeStore } from "@/stores/employeeStore";
import { Button, Form, Select } from "antd";
import { toast } from "react-toastify";


const EditSortCategory = () => {
    const { queryParams } = useQueryParams();
    const { selectedRows } = useSelectedRowsCategory();
    const { updateManyEmployee, fetchEmployees } = useEmployeeStore();

    const handleEditMulti = async (values: { typeChange: string }) => {
        const type = values.typeChange;

        if (type === undefined) {
            return;
        }

        if (selectedRows.length > 0) {
            try {
                const status = await updateManyEmployee(selectedRows, type);

                if (status !== 500) {
                    toast.success("Xóa thành công !!");
                    fetchEmployees("?" + queryParams.toString() as string);
                }
            } catch (err) {
                console.log(err);
            }
        }
    }
    return (
        <>
            <div className="mt-5 rounded-xl bg-white py-5 px-2 border-[1px] border-solid border-slate-200">
                <h2 className='pb-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Chỉnh sửa theo tiêu chí</h2>
                <div className='flex mt-4 items-center justify-between'>
                    <div className="flex items-center justify-center">

                    </div>
                    <div className="flex items-center justify-center w-2/5">
                        <Form onFinish={handleEditMulti} className='flex items-center justify-center'>
                            <Form.Item name="typeChange" className='!m-0' label="Thay đổi: ">
                                <Select style={{ width: 300 }} placeholder={"Chọn tiêu chí thay đổi"}>
                                    <Select.Option value="delete">Xóa</Select.Option>
                                </Select>
                            </Form.Item>
                            <Button htmlType="submit" type='primary' className='mx-2'>Thay đổi</Button>
                        </Form>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditSortCategory;