'use client'
import { useSelectedRowsAccountGuest } from "@/app/(admin)/admin/account-guest/page";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { Button, Form, Select } from "antd";
import { toast } from "react-toastify";


const EditSortAccountGuest = () => {
    const { queryParams, setQueryParams } = useQueryParams();
    const { selectedRows, setSelectedRows } = useSelectedRowsAccountGuest();


    const handleSortChange = (value: string) => {
        if (value !== "all") {
            // Lấy các tham số hiện tại từ queryParams
            const currentParams = new URLSearchParams(queryParams.toString());

            // Cập nhật filter, nhưng giữ các tham số khác
            currentParams.set("sort", value);

            // Cập nhật lại queryParams
            setQueryParams(currentParams);
        } else {
            const currentParams = new URLSearchParams(queryParams.toString());
            currentParams.delete("sort"); // ✅ Xoá key sort nếu là "all"
            setQueryParams(currentParams);
        }
    }

    const handleEditMulti = async (values: { typeChange: string }) => {
        const type = values.typeChange;

        if (type === undefined) {
            return;
        }

        if (selectedRows.length > 0) {
            try {
                // const status = await updateManyEmployee(selectedRows, type);

                // if (status !== 500) {
                //     toast.success("Cập nhật thành công !!");
                //     fetchEmployees("?" + queryParams.toString() as string);
                //     if (type.split(":")[0] === "delete")
                //         setSelectedRows([]);
                // }
            } catch (err) {
                console.log(err);
            }
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
                            defaultValue="Tất cả"
                            style={{ width: 200 }}
                            options={[
                                { value: 'all', label: 'Tất cả' },
                                { value: 'email_asc', label: 'Email tăng dần A-Z' },
                                { value: 'email_desc', label: 'Email giảm dần Z-A' }
                            ]}
                        />
                    </div>
                    <div className="flex items-center justify-center w-2/5">
                        <Form onFinish={handleEditMulti} className='flex items-center justify-center'>
                            <Form.Item name="typeChange" className='!m-0' label="Thay đổi: ">
                                <Select style={{ width: 300 }} placeholder={"Chọn tiêu chí thay đổi"}>
                                    <Select.Option value="update:status_ACTIVE">Hoạt động</Select.Option>
                                    <Select.Option value="update:status_INACTIVE">Bị cấm</Select.Option>
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

export default EditSortAccountGuest;