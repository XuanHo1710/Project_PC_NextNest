'use client'
import { Button, Form, Input, Select, Switch } from "antd";
import { useEffect } from "react";
import { useUpdateAccountGuest } from "@/hooks/admin";
import { IAccountGuest } from "@/types/account-guest";
import { DataType } from "@/types/table.d";
import { toast } from "react-toastify";

interface UpdateModalAccountGuestProps {
    setOpen: (open: boolean) => void;
    dataAccountGuest: DataType<IAccountGuest> | null;
}

const UpdateModalAccountGuest = ({ setOpen, dataAccountGuest }: UpdateModalAccountGuestProps) => {
    const [form] = Form.useForm();
    const updateAccountGuest = useUpdateAccountGuest();

    useEffect(() => {
        if (dataAccountGuest) {
            form.setFieldsValue({
                fullname: dataAccountGuest.fullname,
                email: dataAccountGuest.email,
                phone: dataAccountGuest.phone,
                accountStatus: dataAccountGuest.accountStatus,
                gender: dataAccountGuest.gender,
                adminNotes: dataAccountGuest.adminNotes,
            });
        }
    }, [dataAccountGuest, form]);

    const handleSubmit = async (values: Partial<IAccountGuest>) => {
        if (!dataAccountGuest?._id) return;

        try {
            await updateAccountGuest.mutateAsync({
                id: dataAccountGuest._id,
                data: values
            });
            toast.success("Cập nhật tài khoản thành công!");
            setOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Cập nhật thất bại!");
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Cập nhật tài khoản khách hàng</h2>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Họ tên"
                        name="fullname"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                    >
                        <Input placeholder="Email" disabled />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="accountStatus"
                    >
                        <Select>
                            <Select.Option value="PENDING">Chờ xác nhận</Select.Option>
                            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                            <Select.Option value="SUSPENDED">Đã khóa</Select.Option>
                            <Select.Option value="DELETED">Đã xóa</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giới tính"
                        name="gender"
                    >
                        <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                            <Select.Option value="OTHER">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ghi chú admin"
                        name="adminNotes"
                        className="col-span-2"
                    >
                        <Input.TextArea rows={3} placeholder="Ghi chú của admin về tài khoản này" />
                    </Form.Item>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateAccountGuest.isPending}
                    >
                        Cập nhật
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default UpdateModalAccountGuest;
