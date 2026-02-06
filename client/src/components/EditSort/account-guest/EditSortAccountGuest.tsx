'use client'
import { useSelectedRowsAccountGuest } from "@/components/Content/ContentAccountGuest";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { useUpdateManyAccountGuests } from "@/hooks/admin";
import { Button, Form, Select } from "antd";
import { toast } from "react-toastify";


const EditSortAccountGuest = () => {
    const { queryParams, setQueryParams } = useQueryParams();
    const { selectedRows, setSelectedRows } = useSelectedRowsAccountGuest();
    const updateManyAccountGuests = useUpdateManyAccountGuests();

    // Backend AccountGuest findAll expects: sortBy, sortOrder
    const handleSortChange = (value: string) => {
        const currentParams = new URLSearchParams(queryParams.toString());

        if (value !== "all") {
            const [sortBy, sortOrder] = value.split("_");
            currentParams.set("sortBy", sortBy);
            currentParams.set("sortOrder", sortOrder);
        } else {
            currentParams.delete("sortBy");
            currentParams.delete("sortOrder");
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
                await updateManyAccountGuests.mutateAsync({
                    ids: selectedRows,
                    typeUpdate: type
                });
                toast.success("Cập nhật thành công !!");
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
                                { value: 'fullname_asc', label: 'Tên A-Z' },
                                { value: 'fullname_desc', label: 'Tên Z-A' },
                                { value: 'email_asc', label: 'Email A-Z' },
                                { value: 'email_desc', label: 'Email Z-A' },
                                { value: 'totalOrders_desc', label: 'Đơn hàng nhiều nhất' },
                                { value: 'totalSpent_desc', label: 'Chi tiêu nhiều nhất' },
                            ]}
                        />
                    </div>
                    <div className="flex items-center justify-center w-2/5">
                        <Form onFinish={handleEditMulti} className='flex items-center justify-center'>
                            <Form.Item name="typeChange" className='!m-0' label="Thay đổi: ">
                                <Select style={{ width: 300 }} placeholder={"Chọn tiêu chí thay đổi"}>
                                    <Select.Option value="update:accountStatus_ACTIVE">Kích hoạt</Select.Option>
                                    <Select.Option value="update:accountStatus_SUSPENDED">Khóa tài khoản</Select.Option>
                                    <Select.Option value="delete">Xóa</Select.Option>
                                </Select>
                            </Form.Item>
                            <Button htmlType="submit" type='primary' className='mx-2' loading={updateManyAccountGuests.isPending}>Thay đổi</Button>
                        </Form>
                    </div>
                </div>
            </div>

        </>
    )
}

export default EditSortAccountGuest;