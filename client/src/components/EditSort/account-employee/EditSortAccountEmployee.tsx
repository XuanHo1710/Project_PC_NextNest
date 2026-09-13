'use client'

import { useSelectedRowsAccountEmployee } from "@/components/Content/ContentAccountEmployee";
import { useHasPermission } from "@/hooks/admin/useHasPermission";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Button, Form, Select } from "antd";
import { useUpdateManyAccountEmployees } from "@/hooks/admin";
import { toast } from "react-toastify";


const EditSortAccountEmployee = () => {
    const { queryParams, setQueryParams } = useQueryParams();
    const { selectedRows, setSelectedRows } = useSelectedRowsAccountEmployee();
    const updateManyAccountEmployees = useUpdateManyAccountEmployees();
    const hasPermission = useHasPermission();

    // Backend expects: sort=key_value (e.g., createdAt_desc, name_asc)
    const handleSortChange = (value: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (value !== "all") {
            currentParams.set("sort", value);
        } else {
            currentParams.delete("sort");
        }

        setQueryParams(currentParams);
    }

    const handleEditMulti = async (values: { typeChange: string }) => {
        const type = values.typeChange;

        if (type === undefined) {
            return;
        }

        if (selectedRows.length > 0) {
            try {
                await updateManyAccountEmployees.mutateAsync({
                    ids: selectedRows,
                    typeUpdate: type
                });
                toast.success("Cập nhật thành công!!");
                if (type.split(":")[0] === "delete") {
                    setSelectedRows([]);
                }
            } catch (err) {
                console.error(err);
                toast.error("Cập nhật thất bại!");
            }
        } else {
            toast.warning("Vui lòng chọn ít nhất 1 tài khoản!");
        }
    }

    return (
        <>
            <div className="mt-5 rounded-xl bg-white py-5 px-2 border-[1px] border-solid border-slate-200">
                <h2 className='pb-2 text-base font-semibold px-2 border-slate-100 border-b-2 border-solid'>Chỉnh sửa và sắp xếp theo tiêu chí</h2>
                <div className='flex mt-4 items-center justify-between'>
                    <div className="flex items-center justify-center">
                        <h3 className="mx-2 text-sm">Sắp xếp theo tiêu chí: </h3>
                        <Select
                            onChange={handleSortChange}
                            defaultValue="all"
                            style={{ width: 200 }}
                            options={[
                                { value: 'all', label: 'Mặc định' },
                                { value: 'createdAt_desc', label: 'Mới nhất' },
                                { value: 'createdAt_asc', label: 'Cũ nhất' },
                                { value: 'name_asc', label: 'Tên A-Z' },
                                { value: 'name_desc', label: 'Tên Z-A' },
                                { value: 'IDEmp_asc', label: 'Mã NV tăng dần' },
                                { value: 'IDEmp_desc', label: 'Mã NV giảm dần' },
                            ]}
                        />
                    </div>
                    <div className="flex items-center justify-center w-2/5">
                        {hasPermission("PATCH", "/api/v1/admin/account-employee/updateMany") &&
                            <Form onFinish={handleEditMulti} className='flex items-center justify-center'>
                                <Form.Item name="typeChange" className='!m-0' label="Thay đổi: ">
                                    <Select style={{ width: 300 }} placeholder={"Chọn tiêu chí thay đổi"}>
                                        <Select.Option value="update:status_ACTIVE">Hoạt động</Select.Option>
                                        <Select.Option value="update:status_INACTIVE">Dừng hoạt động</Select.Option>
                                        <Select.Option value="delete">Xóa</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Button htmlType="submit" type='primary' className='mx-2' loading={updateManyAccountEmployees.isPending}>Thay đổi</Button>
                            </Form>
                        }
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditSortAccountEmployee;