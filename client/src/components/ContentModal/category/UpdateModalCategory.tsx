'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { JSX, useEffect } from 'react';
import { ICategory } from '@/types/modal.d';
import { useUpdateCategory, useCategories } from '@/hooks/admin';




export default function UpdateModalCategory({ dataCategory, setOpen }: { dataCategory: ICategory | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const updateCategory = useUpdateCategory();
    const { data: categories = [] } = useCategories();

    useEffect(() => {
        if (dataCategory !== null) {
            console.log(dataCategory);

            form.setFieldsValue({
                name: dataCategory.name,
                parent: dataCategory.parent !== null ? dataCategory.parent?._id : "",
            });
        }
    }, [dataCategory, form]);


    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleUpdate = async (data: ICategory) => {
        if (!dataCategory?._id) return;

        try {
            await updateCategory.mutateAsync({
                id: dataCategory._id,
                data: data
            });
            form.resetFields(); // reset form
            setOpen(false);
        } catch {
            // Error is handled in the hook
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
            if (category._id !== dataCategory?._id) {
                const option = (
                    <Select.Option key={category._id} value={category._id}>
                        {`${prefix} ${category.name}`}
                    </Select.Option>
                );

                const childrenOptions = category.children && category.children.length > 0
                    ? renderCategoryOptions(category.children, level + 1)
                    : [];

                return [option, ...childrenOptions];
            }
            return [];
        });
    };



    return (
        <>
            <Spin size='large' spinning={updateCategory.isPending}>
                <h2 className='text-lg font-bold my-4'>Cập nhật danh mục:</h2>
                {dataCategory !== null &&
                    <Form
                        onFinish={handleUpdate}
                        {...layout}
                        form={form}
                    >
                        <Form.Item label="Tên danh mục" name="name" className='font-sans text-lg'>
                            <Input placeholder='Nhập tên danh mục ...' />
                        </Form.Item>
                        <Form.Item label="Chọn danh mục cha" name="parent" className='font-sans text-lg'>
                            <Select placeholder="Chọn danh mục cha (nếu có)">
                                <Select.Option value="">Không</Select.Option>
                                {renderCategoryOptions(buildCategoryTree(categories))}
                            </Select>
                        </Form.Item>
                        <div className='text-right mb-10'>
                            <Button loading={updateCategory.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Sửa</Button>
                            <Button loading={updateCategory.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }
            </Spin>
        </>
    );
}
