'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Spin } from 'antd';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQueryParams } from '@/hooks/QueryParamsContext';
import { useRoleStore } from '@/stores/server/roleStore';
import { IRole } from '@/types/modal.d';




export default function UpdateModalRole({ dataRole, setOpen }: { dataRole: IRole | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const { updateRole, fetchRoles, loading } = useRoleStore();
    const { queryParams } = useQueryParams();

    useEffect(() => {
        if (dataRole !== null) {
            form.setFieldsValue({
                name: dataRole.name,
                description: dataRole.description
            });
        }
    }, [dataRole, form]);


    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleUpdate = async (data: IRole) => {
        const role = {
            ...data,
            _id: dataRole?._id
        }

        try {
            const status = await updateRole(role);
            if (status !== 500) {
                toast.success("Sửa vai trò thành công !!");
                fetchRoles("?" + queryParams.toString() as string)
                form.resetFields(); // reset form
                setOpen(false);
            }
        } catch (err) {
            toast.error("Sửa vai trò thất bại do lỗi: " + err)
        }
    }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Cập nhật vai trò:</h2>
                {dataRole !== null &&
                    <Form
                        onFinish={handleUpdate}
                        {...layout}
                        form={form}
                    >
                        <Form.Item label="Tên quyền" name="name" className='font-sans text-lg' rules={[{
                            required: true,
                            message: "Tên quyền không được để trống",
                            whitespace: true
                        }]}>
                            <Input placeholder='Nhập tên quyền ...' />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description" className='font-sans text-lg'>
                            <Input placeholder='Nhập mô tả ...' />
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
