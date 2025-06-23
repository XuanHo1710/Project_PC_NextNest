'use client'
import { useCategoryStore } from '@/stores/categoryStore';
import { ICategory } from '@/types/modal.d';
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { JSX } from 'react';
import { toast } from 'react-toastify';




export default function ContentModalCategory() {
    const { addCategory, loading, categorys } = useCategoryStore();

    const [form] = Form.useForm();

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleAdd = async (data: ICategory) => {
        const category = {
            ...data,
        };
        try {
            const status = await addCategory(category);
            if (status !== 500) {
                toast.success("Thêm danh mục sản phẩm thành công!!");
                form.resetFields();
            }
        } catch (error) {
            toast.error(error as string);
        }
    }

    const buildCategoryTree = (flatCategories: ICategory[]): ICategory[] => {
        const idToNodeMap = new Map<string, ICategory>();

        // Bản sao để tránh đụng dữ liệu gốc
        const categoriesCopy = flatCategories.map(cat => ({ ...cat, children: [] }));

        // Map id → node
        categoriesCopy.forEach(cat => {
            if (cat._id) {
                idToNodeMap.set(cat._id, cat);
            }
        });

        const tree: ICategory[] = [];

        categoriesCopy.forEach(cat => {
            if (cat.parent && cat.parent._id) {
                const parent = idToNodeMap.get(cat.parent._id);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(cat);
                }
            } else {
                tree.push(cat); // root node
            }
        });

        return tree;
    };


    const renderCategoryOptions = (categories: ICategory[], level = 0): JSX.Element[] => {
        const prefix = '-'.repeat(level);

        return categories.flatMap(category => {
            const option = (
                <Select.Option key={category._id} value={category._id}>
                    {`${prefix} ${category.name}`}
                </Select.Option>
            );

            const childrenOptions = category.children && category.children.length > 0
                ? renderCategoryOptions(category.children, level + 1)
                : [];

            return [option, ...childrenOptions];
        });
    };



    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Thêm mới danh mục sản phẩm:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        name: "",
                        parent: "",
                    }}
                    form={form}
                >
                    <Form.Item label="Tên danh mục" name="name" className='font-sans text-lg'>
                        <Input placeholder='Nhập tên danh mục ...' />
                    </Form.Item>
                    <Form.Item label="Chọn danh mục cha" name="parent" className='font-sans text-lg'>
                        <Select allowClear showSearch placeholder="Chọn danh mục cha (nếu có)">
                            <Select.Option value="">Không</Select.Option>
                            {renderCategoryOptions(buildCategoryTree(categorys))}

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
