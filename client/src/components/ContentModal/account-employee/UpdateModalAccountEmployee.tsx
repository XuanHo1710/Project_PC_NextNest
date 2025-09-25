'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQueryParams } from '@/hooks/QueryParamsContext';
import { useAccountEmployeeStore } from '@/stores/server/accountEmployeeStore';
import { useEmployeeStore } from '@/stores/server/employeeStore';
import { useRoleStore } from '@/stores/server/roleStore';
import { IAccountEmployee } from '@/types/modal.d';



export default function UpdateModalAccountEmployee({ dataAccountEmployee, setOpen }: { dataAccountEmployee: IAccountEmployee | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const { updateAccountEmployee, fetchAccountEmployees, loading } = useAccountEmployeeStore();
    const { employees, getEmployeesNoAccount } = useEmployeeStore();
    const { queryParams } = useQueryParams();
    const { roles, fetchRoles } = useRoleStore();



    useEffect(() => {
        if (dataAccountEmployee !== null) {
            form.setFieldsValue({
                IDEmp: dataAccountEmployee.IDEmp,
                password: dataAccountEmployee.password,
                status: dataAccountEmployee.status,
                employeeId: dataAccountEmployee.employee._id,
                roleId: dataAccountEmployee?.role ? dataAccountEmployee?.role._id : ""
            });
            getEmployeesNoAccount();
            fetchRoles();
        }
    }, [getEmployeesNoAccount, fetchRoles, dataAccountEmployee, form]);


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
            employeeId: data.employeeId
        }

        try {
            const status = await updateAccountEmployee(account);
            if (status !== 500) {
                toast.success("Sửa tài khoản thành công !!");
                fetchAccountEmployees("?" + queryParams.toString() as string)
                form.resetFields(); // reset form
                setOpen(false);
            }
        } catch (err) {
            toast.error("Sửa tài khoản thất bại do lỗi: " + err)
        }
    }



    return (
        <>
            <Spin size='large' spinning={loading}>
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
                        <Form.Item label="Nhân viên" name="employeeId" className='font-sans text-lg'>
                            <Select placeholder="Chọn nhân viên">
                                {employees.length > 0 &&
                                    employees.map(em => (
                                        <Select.Option key={em._id} value={em._id}>{em.name + "  " + em.age}</Select.Option>
                                    ))
                                }
                                <Select.Option value={dataAccountEmployee.employee._id}>{dataAccountEmployee.employee.name + "  " + dataAccountEmployee.employee.age}</Select.Option>
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
                            <Button loading={loading} htmlType='submit' variant='solid' color='primary' className='text-right'>Sửa</Button>
                            <Button loading={loading} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }
            </Spin>
        </>
    );
}
