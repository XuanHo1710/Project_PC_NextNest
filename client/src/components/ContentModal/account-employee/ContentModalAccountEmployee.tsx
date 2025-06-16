'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useEmployeeStore } from '@/stores/employeeStore';
import { IAccountEmployee, useAccountEmployeeStore } from '@/stores/accountEmployeeStore';
import { useEffect } from 'react';





export default function ContentModalAccountEmployee() {
    const { addAccountEmployee, loading, fetchAccountEmployees } = useAccountEmployeeStore();
    const { employees, getEmployeesNoAccount } = useEmployeeStore();

    useEffect(() => {
        getEmployeesNoAccount();
    }, [getEmployeesNoAccount])

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
            const status = await addAccountEmployee(account);
            if (status !== 500) {
                toast.success("Thêm tài khoản thành công!!");
                fetchAccountEmployees();
                form.resetFields();
            }
        } catch (error) {
            toast.error(error as string);
        }
    }




    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Thêm mới tài khoản nhân viên:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        IDEmp: "",
                        password: "",
                        employeeId: "",
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

                    <Form.Item label="Trạng thái" name="status" className='font-sans text-lg'>
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                            <Select.Option value="INACTIVE">Dừng hoạt động</Select.Option>
                        </Select>
                    </Form.Item>
                    <div className='text-right mb-10'>
                        <Button loading={loading} htmlType='submit' variant='solid' color='primary' className='text-right'>Thêm mới</Button>
                        <Button loading={loading} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin >
        </>
    );

}
