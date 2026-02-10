'use client'
import { IBrand } from '@/types/brand';
import { Button, Form, Input, Select, Spin, Switch } from 'antd';
import { useCreateBrand } from '@/hooks/admin/useBrand';

const { TextArea } = Input;

interface ContentModalBrandProps {
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ContentModalBrand({ setOpen }: ContentModalBrandProps) {
    const [form] = Form.useForm();

    // Pass callback to close modal on success
    const addBrand = useCreateBrand(() => {
        form.resetFields();
        if (setOpen) {
            setOpen(false);
        }
    });

    const layout = {
        labelCol: {
            span: 6,
        },
        wrapperCol: {
            span: 18,
        },
    };

    const handleAdd = async (data: Omit<IBrand, '_id'>) => {
        const brand = {
            ...data,
            status: data.status || 'ACTIVE',
        };
        try {
            await addBrand.mutateAsync(brand);
        } catch {
            // Error is handled in the hook
        }
    }

    return (
        <>
            <Spin size='large' spinning={addBrand.isPending}>
                <h2 className='text-lg font-bold my-4'>Thêm mới thương hiệu:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        name: "",
                        description: "",
                        logo: "",
                        website: "",
                        status: "ACTIVE",
                        feature: false,
                    }}
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

                    <Form.Item
                        label="Nổi bật"
                        name="feature"
                        className='font-sans text-lg'
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Có" unCheckedChildren="Không" />
                    </Form.Item>

                    <div className='text-right mb-10'>
                        <Button loading={addBrand.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Thêm mới</Button>
                        <Button loading={addBrand.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin>
        </>
    );
}
