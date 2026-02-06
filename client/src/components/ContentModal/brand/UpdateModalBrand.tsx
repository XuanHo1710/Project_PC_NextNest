'use client'
import '@ant-design/v5-patch-for-react-19';
import { Button, Form, Input, Select, Spin } from 'antd';
import { useEffect } from 'react';
import { IBrand } from '@/types/brand';
import { useUpdateBrand } from '@/hooks/admin/useBrand';

const { TextArea } = Input;

export default function UpdateModalBrand({ dataBrand, setOpen }: { dataBrand: IBrand | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();

    // Pass callback to close modal on success
    const updateBrand = useUpdateBrand(() => {
        form.resetFields();
        setOpen(false);
    });

    useEffect(() => {
        if (dataBrand !== null) {
            form.setFieldsValue({
                name: dataBrand.name,
                description: dataBrand.description || '',
                logo: dataBrand.logo || '',
                website: dataBrand.website || '',
                status: dataBrand.status || 'ACTIVE',
            });
        }
    }, [dataBrand, form]);

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };

    const handleUpdate = async (data: Partial<IBrand>) => {
        if (!dataBrand?._id) return;

        try {
            await updateBrand.mutateAsync({
                id: dataBrand._id,
                data: data
            });
        } catch {
            // Error is handled in the hook
        }
    }

    return (
        <>
            <Spin size='large' spinning={updateBrand.isPending}>
                <h2 className='text-lg font-bold my-4'>Cập nhật thương hiệu:</h2>
                {dataBrand !== null &&
                    <Form
                        onFinish={handleUpdate}
                        {...layout}
                        form={form}
                    >
                        <Form.Item
                            label="Tên thương hiệu"
                            name="name"
                            className='font-sans text-lg'
                            rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu!' }]}
                        >
                            <Input placeholder='Nhập tên thương hiệu ...' />
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            className='font-sans text-lg'
                        >
                            <TextArea
                                placeholder='Nhập mô tả thương hiệu ...'
                                rows={4}
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Logo URL"
                            name="logo"
                            className='font-sans text-lg'
                        >
                            <Input placeholder='Nhập URL logo ...' />
                        </Form.Item>

                        <Form.Item
                            label="Website"
                            name="website"
                            className='font-sans text-lg'
                            rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }]}
                        >
                            <Input placeholder='Nhập website (VD: https://example.com) ...' />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái"
                            name="status"
                            className='font-sans text-lg'
                        >
                            <Select>
                                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                                <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
                            </Select>
                        </Form.Item>

                        <div className='text-right mb-10'>
                            <Button loading={updateBrand.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Cập nhật</Button>
                            <Button loading={updateBrand.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }
            </Spin>
        </>
    );
}
