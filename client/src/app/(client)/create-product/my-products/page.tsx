"use client";

import { useState, useMemo } from "react";
import {
    Table,
    Input,
    Button,
    Tag,
    Space,
    Popconfirm,
    Image,
    Tooltip,
    Pagination,
    Modal,
    Form,
    Select,
    message,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    StopOutlined,
    EyeOutlined,
    ReloadOutlined,
    ShoppingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useMyProducts,
    useClientUpdateProduct,
    useClientRemoveProduct,
} from "@/hooks/client/useProductManage";
import {
    getProductImage,
    getProductDisplayPrice,
    getProductOriginalPrice,
    getProductDiscount,
    getProductStock,
    formatCurrencyVND,
} from "@/utils/productHelpers";
import type { IProduct, IProductCard } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyProductsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [editForm] = Form.useForm();

    const { data, isLoading, refetch } = useMyProducts(page, limit, search);
    const updateProduct = useClientUpdateProduct();
    const removeProduct = useClientRemoveProduct();

    // Stats computed from data
    const products = data?.data || [];
    const totalProducts = data?.pagination?.totalItems || 0;
    const activeCount = products.filter((p) => p.status === "ACTIVE").length;
    const inactiveCount = products.filter((p) => p.status === "INACTIVE").length;
    const outOfStockCount = products.filter((p) => {
        const card = p as unknown as IProductCard;
        return getProductStock(card) === 0;
    }).length;

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleEdit = (record: IProduct) => {
        setEditingProduct(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description || "",
            status: record.status,
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            if (!editingProduct) return;
            await updateProduct.mutateAsync({
                id: editingProduct._id,
                data: values,
            });
            setEditModalOpen(false);
            setEditingProduct(null);
        } catch {
            // form validation error
        }
    };

    const handleRemove = async (id: string) => {
        await removeProduct.mutateAsync(id);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Tag color="green">Đang bán</Tag>;
            case "INACTIVE":
                return <Tag color="orange">Ẩn</Tag>;
            case "STOPSOLD":
                return <Tag color="red">Ngừng bán</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns: ColumnsType<any> = [
        {
            title: "#",
            key: "index",
            width: 50,
            render: (_, __, index) => (page - 1) * limit + index + 1,
        },
        {
            title: "Ảnh",
            key: "image",
            width: 80,
            render: (_, record) => {
                const img = getProductImage(record as IProductCard);
                return img ? (
                    <Image
                        src={img}
                        alt={record.name}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">
                        No img
                    </div>
                );
            },
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            render: (name: string, record: any) => (
                <div>
                    <div className="font-medium text-sm line-clamp-1">{name}</div>
                    <div className="text-xs text-gray-400">{record.slug}</div>
                </div>
            ),
        },
        {
            title: "Giá",
            key: "price",
            width: 180,
            render: (_, record) => {
                const card = record as IProductCard;
                const displayPrice = getProductDisplayPrice(card);
                const originalPrice = getProductOriginalPrice(card);
                const discount = getProductDiscount(card);
                return (
                    <div>
                        <div className="font-semibold text-red-500 text-sm">
                            {formatCurrencyVND(displayPrice)}
                        </div>
                        {discount > 0 && (
                            <div className="text-xs text-gray-400 line-through">
                                {formatCurrencyVND(originalPrice)}
                            </div>
                        )}
                        {discount > 0 && (
                            <Tag color="red" className="text-xs mt-0.5">
                                -{discount}%
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Tồn kho",
            key: "stock",
            width: 90,
            align: "center",
            render: (_, record) => {
                const stock = getProductStock(record as IProductCard);
                return (
                    <span
                        className={`font-medium ${stock === 0 ? "text-red-500" : "text-green-600"}`}
                    >
                        {stock}
                    </span>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 110,
            align: "center",
            render: (status: string) => getStatusTag(status),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date: string) =>
                date
                    ? new Date(date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })
                    : "—",
        },
        {
            title: "Hành động",
            key: "action",
            width: 160,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/product/${record.slug}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            className="!text-blue-500"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Gỡ sản phẩm đang bán"
                        description="Sản phẩm sẽ không còn hiển thị trên trang. Bạn có chắc không?"
                        onConfirm={() => handleRemove(record._id)}
                        okText="Gỡ"
                        cancelText="Hủy"
                        okButtonProps={{
                            danger: true,
                            loading: removeProduct.isPending,
                        }}
                    >
                        <Tooltip title="Gỡ sản phẩm đang bán">
                            <Button
                                type="text"
                                size="small"
                                icon={<StopOutlined />}
                                className="!text-red-500"
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold m-0">Sản phẩm đã đăng bán</h1>
                    <p className="text-gray-500 text-sm m-0 mt-1">
                        Quản lý các sản phẩm bạn đã đăng bán (
                        {totalProducts} sản phẩm)
                    </p>
                </div>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                    Làm mới
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <ShoppingOutlined className="text-blue-500 text-lg" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 m-0">Tổng sản phẩm</p>
                        <p className="text-xl font-bold m-0">{totalProducts}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <CheckCircleOutlined className="text-green-500 text-lg" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 m-0">Đang bán</p>
                        <p className="text-xl font-bold text-green-600 m-0">{activeCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <CloseCircleOutlined className="text-orange-500 text-lg" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 m-0">Đang ẩn</p>
                        <p className="text-xl font-bold text-orange-500 m-0">{inactiveCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <InboxOutlined className="text-red-500 text-lg" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 m-0">Hết hàng</p>
                        <p className="text-xl font-bold text-red-500 m-0">{outOfStockCount}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <Input.Search
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={handleSearch}
                    onPressEnter={handleSearch}
                    enterButton={<SearchOutlined />}
                    style={{ maxWidth: 400 }}
                    allowClear
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={products}
                    loading={isLoading}
                    rowKey="_id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    size="middle"
                />
            </div>

            {/* Pagination */}
            {totalProducts > limit && (
                <div className="flex justify-end mt-4">
                    <Pagination
                        current={page}
                        total={totalProducts}
                        pageSize={limit}
                        onChange={(p) => setPage(p)}
                        showTotal={(total) => `Tổng ${total} sản phẩm`}
                        showSizeChanger={false}
                    />
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                title="Chỉnh sửa sản phẩm"
                open={editModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditingProduct(null);
                }}
                confirmLoading={updateProduct.isPending}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                width={600}
            >
                <Form form={editForm} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input placeholder="Tên sản phẩm" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={4} placeholder="Mô tả sản phẩm" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true }]}
                    >
                        <Select
                            options={[
                                { value: "ACTIVE", label: "Đang bán" },
                                { value: "INACTIVE", label: "Ẩn" },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
