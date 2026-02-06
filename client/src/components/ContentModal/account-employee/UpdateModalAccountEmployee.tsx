'use client'
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { useEffect } from 'react';
import { IAccountEmployee } from '@/types/account-employee';
import { useUpdateAccountEmployee, useEmployeesNoAccount, useRoles } from '@/hooks/admin';



export default function UpdateModalAccountEmployee({ dataAccountEmployee, setOpen }: { dataAccountEmployee: IAccountEmployee | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const updateAccountEmployee = useUpdateAccountEmployee();
    const { data: employees = [] } = useEmployeesNoAccount();
    const { data: roles = [] } = useRoles();



    useEffect(() => {
        if (dataAccountEmployee !== null) {
            form.setFieldsValue({
                IDEmp: dataAccountEmployee.IDEmp,
                password: dataAccountEmployee.password,
                status: dataAccountEmployee.status,
                roleId: dataAccountEmployee?.roleId._id ? dataAccountEmployee?.roleId._id : ""
            });
        }
    }, [dataAccountEmployee, form]);


    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleUpdate = async (data: IAccountEmployee) => {

        const account = {
            ...data,
            _id: dataAccountEmployee?._id,
        }

        if (!dataAccountEmployee?._id) return;

        try {
            await updateAccountEmployee.mutateAsync({
                id: dataAccountEmployee._id,
                data: account
            });
            form.resetFields(); // reset form
            setOpen(false);
        } catch {
            // Error is handled in the hook
        }
    }



    return (
        <>
            <Spin size='large' spinning={updateAccountEmployee.isPending}>
                <h2 className='text-lg font-bold my-4'>Cập nhật nhân viên:</h2>
                {dataAccountEmployee !== null &&
                    <Form
                        onFinish={handleUpdate}
                        {...layout}
                        form={form}
                    >
                        <Form.Item label="Mã số nhân viên" name="IDEmp" className='font-sans text-lg' rules={[
                            {
                                required: true,
                                message: 'IDEmp không được để trống',
                                whitespace: true
                            }
                        ]}>
                            <Input placeholder='Nhập mã số của nhân viên ...' />
                        </Form.Item>
                        <Form.Item label="Mật khẩu" name="password" className='font-sans text-lg' rules={[
                            {
                                required: true,
                                message: 'Mật khẩu không được để trống',
                                whitespace: true
                            }
                        ]}>
                            <Input.Password placeholder='Nhập mật khẩu ...' />
                        </Form.Item>
                        <Form.Item label="Vai trò" name="roleId" className='font-sans text-lg'>
                            <Select placeholder="Chọn vai trò">
                                {roles.length > 0 &&
                                    roles.map(r => (
                                        <Select.Option key={r._id} value={r._id}>{r.name}</Select.Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="Trạng thái" name="status" className='font-sans text-lg'>
                            <Select placeholder="Chọn trạng thái">
                                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                                <Select.Option value="INACTIVE">Dừng hoạt động</Select.Option>
                            </Select>
                        </Form.Item>
                        <div className='text-right mb-10'>
                            <Button loading={updateAccountEmployee.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Sửa</Button>
                            <Button loading={updateAccountEmployee.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }
            </Spin>
        </>
    );
}
