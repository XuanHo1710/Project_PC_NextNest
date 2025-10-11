'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Spin } from 'antd';
import { useEffect } from 'react';
import { IRole } from '@/types/modal.d';
import { useUpdateRole } from '@/hooks/admin';




export default function UpdateModalRole({ dataRole, setOpen }: { dataRole: IRole | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const updateRole = useUpdateRole();

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
        if (!dataRole?._id) return;

        try {
            await updateRole.mutateAsync({
                id: dataRole._id,
                data: data
            });
            form.resetFields(); // reset form
            setOpen(false);
        } catch {
            // Error is handled in the hook
        }
    }


    return (
        <>
            <Spin size='large' spinning={updateRole.isPending}>
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
                            <Button loading={updateRole.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Sửa</Button>
                            <Button loading={updateRole.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }
            </Spin>
        </>
    );
}
