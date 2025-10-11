'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { IAccountEmployee } from '@/types/modal.d';
import { useCreateAccountEmployee, useEmployeesNoAccount, useRoles } from '@/hooks/admin';





export default function ContentModalAccountEmployee() {
    const addAccountEmployee = useCreateAccountEmployee();
    const { data: employees = [] } = useEmployeesNoAccount();
    const { data: roles = [] } = useRoles();

    const [form] = Form.useForm();

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleAdd = async (data: IAccountEmployee) => {

        const account = {
            ...data,
        }

        try {
            await addAccountEmployee.mutateAsync(account as Omit<IAccountEmployee, '_id'>);
            form.resetFields();
        } catch {
            // Error is handled in the hook
        }
    }




    return (
        <>
            <Spin size='large' spinning={addAccountEmployee.isPending}>
                <h2 className='text-lg font-bold my-4'>Thêm mới tài khoản nhân viên:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        IDEmp: "",
                        password: "",
                        employeeId: "",
                        roleId: "",
                        status: "ACTIVE"
                    }}
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
                    <Form.Item label="Nhân viên" name="employeeId" className='font-sans text-lg'>
                        <Select placeholder="Chọn nhân viên">
                            {employees.length > 0 &&
                                employees.map(em => (
                                    <Select.Option key={em._id} value={em._id}>{"Tên: " + em.name + " - Tuổi: " + em.age}</Select.Option>
                                ))
                            }
                        </Select>
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
                        <Button loading={addAccountEmployee.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Thêm mới</Button>
                        <Button loading={addAccountEmployee.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin >
        </>
    );

}
