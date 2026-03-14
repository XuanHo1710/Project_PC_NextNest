'use client'
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, Select, Spin } from 'antd';
import { useEffect, useMemo } from 'react';
import { ICategory } from '@/types/category';
import { useUpdateCategory, useCategoriesAll } from '@/hooks/admin';




export default function UpdateModalCategory({ dataCategory, setOpen }: { dataCategory: ICategory | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [form] = Form.useForm();
    const updateCategory = useUpdateCategory();
    const { data: categoriesData } = useCategoriesAll();
    const categories = categoriesData?.data ?? [];

    useEffect(() => {
        if (dataCategory !== null) {
            const normalizedParentId =
                dataCategory.parentId && typeof dataCategory.parentId === 'object'
                    ? dataCategory.parentId._id
                    : (dataCategory.parentId || "");

            form.setFieldsValue({
                name: dataCategory.name,
                parentId: normalizedParentId,
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
            if (cat.parentId) {
                const parentKey = typeof cat.parentId === 'string' ? cat.parentId : cat.parentId._id;
                const parent = idToNodeMap.get(parentKey);
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

    const getDescendantIds = (categoriesTree: ICategory[], targetId?: string): Set<string> => {
        const blocked = new Set<string>();
        if (!targetId) return blocked;

        const dfs = (node: ICategory): boolean => {
            const nodeId = String(node._id);
            if (nodeId === targetId) {
                blocked.add(nodeId);
                const collect = (child: ICategory) => {
                    blocked.add(String(child._id));
                    (child.children || []).forEach(collect);
                };
                (node.children || []).forEach(collect);
                return true;
            }
            return (node.children || []).some(dfs);
        };

        categoriesTree.some(dfs);
        return blocked;
    };

    const flattenCategoryOptions = (
        nodes: ICategory[],
        blockedIds: Set<string>,
        level = 0,
    ): Array<{ value: string; label: string; searchText: string }> => {
        const prefix = level > 0 ? `${'-'.repeat(level)} ` : '';
        return nodes.flatMap((category) => {
            const nodeId = String(category._id);
            const current = blockedIds.has(nodeId)
                ? []
                : [{
                    value: category._id,
                    label: `${prefix}${category.name}`,
                    searchText: `${category.name} ${category.slug || ''}`.toLowerCase(),
                }];

            const children = category.children && category.children.length > 0
                ? flattenCategoryOptions(category.children, blockedIds, level + 1)
                : [];

            return [...current, ...children];
        });
    };

    const categoryOptions = useMemo(() => {
        const tree = buildCategoryTree(categories);
        const blocked = getDescendantIds(tree, dataCategory?._id);

        return [
            { value: '', label: 'Không', searchText: 'khong none' },
            ...flattenCategoryOptions(tree, blocked),
        ];
    }, [categories, dataCategory?._id]);



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
                        <Form.Item label="Tên danh mục" name="name" className='font-sans text-lg' rules={[
                            {
                                required: true,
                                message: 'Tên danh mục không được để trống',
                                whitespace: true
                            }
                        ]}>
                            <Input placeholder='Nhập tên danh mục ...' />
                        </Form.Item>
                        <Form.Item label="Chọn danh mục cha" name="parentId" className='font-sans text-lg'>
                            <Select
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                placeholder="Chọn danh mục cha (nếu có)"
                                options={categoryOptions}
                                filterOption={(input, option) => {
                                    const keyword = input.toLowerCase().trim();
                                    return (
                                        String(option?.label || '').toLowerCase().includes(keyword)
                                        || String((option as any)?.searchText || '').includes(keyword)
                                    );
                                }}
                            />
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
