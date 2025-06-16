'use client'
import { IRole, useRoleStore } from '@/stores/roleStore';
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Spin } from 'antd';
import { toast } from 'react-toastify';




export default function ContentModalRole() {
    const { addRole, loading } = useRoleStore();

    const [form] = Form.useForm();

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleAdd = async (data: IRole) => {
        const role = {
            ...data,
        };
        try {
            const status = await addRole(role);
            if (status !== 500) {
                toast.success("Thêm vai trò thành công!!");
                form.resetFields();
            }
        } catch (error) {
            toast.error(error as string);
        }
    }

    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Thêm mới vai trò:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        name: "",
                        description: "",
                    }}
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
                        <Button loading={loading} htmlType='submit' variant='solid' color='primary' className='text-right'>Thêm mới</Button>
                        <Button loading={loading} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin >
        </>
    );
}
