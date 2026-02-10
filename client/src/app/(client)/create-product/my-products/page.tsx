"use client";

import { useState, useEffect, useCallback } from "react";
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
    InputNumber,
    Spin,
    Tabs,
    Divider,
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
    SaveOutlined,
    PictureOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useMyProducts,
    useClientUpdateProduct,
    useClientRemoveProduct,
} from "@/hooks/client/useProductManage";
import { productManageClientService } from "@/services/client";
import { formatCurrencyVND } from "@/utils/productHelpers";
import type { IProduct, IProductVariant } from "@/types";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/common/RichTextEditor";

export default function MyProductsPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Variants map for table display (productId → variants[])
    const [variantsMap, setVariantsMap] = useState<Record<string, IProductVariant[]>>({});
    const [loadingTableVariants, setLoadingTableVariants] = useState(false);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [editForm] = Form.useForm();
    const [editVariants, setEditVariants] = useState<IProductVariant[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [savingVariants, setSavingVariants] = useState(false);

    // Attribute insertion state
    const [newAttrKey, setNewAttrKey] = useState("");
    const [newAttrValue, setNewAttrValue] = useState("");

    const { data, isLoading, refetch } = useMyProducts(page, limit, search);
    const updateProduct = useClientUpdateProduct();
    const removeProduct = useClientRemoveProduct();

    // Derived data
    const products = data?.data || [];
    const totalProducts = data?.pagination?.totalItems || 0;
    const activeCount = products.filter((p) => p.status === "ACTIVE").length;
    const inactiveCount = products.filter((p) => p.status === "INACTIVE").length;

    // Fetch variants for all products on current page (for table display)
    useEffect(() => {
        if (products.length === 0) {
            setVariantsMap({});
            return;
        }
        const productIds = products.map((p) => p._id);
        setLoadingTableVariants(true);
        Promise.all(
            productIds.map((id) =>
                productManageClientService
                    .getVariantsByProduct(id)
                    .then((res) => ({
                        id,
                        variants: ((res as any)?.data || []) as IProductVariant[],
                    }))
                    .catch(() => ({ id, variants: [] as IProductVariant[] })),
            ),
        ).then((results) => {
            const map: Record<string, IProductVariant[]> = {};
            results.forEach((r) => {
                map[r.id] = r.variants;
            });
            setVariantsMap(map);
            setLoadingTableVariants(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    // Computed stats from variantsMap
    const outOfStockCount = products.filter((p) => {
        const variants = variantsMap[p._id] || [];
        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        return totalStock === 0;
    }).length;

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    const handleEdit = async (record: IProduct) => {
        setEditingProduct(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description || "",
            status: record.status,
        });
        setEditModalOpen(true);
        setLoadingVariants(true);
        setNewAttrKey("");
        setNewAttrValue("");
        try {
            const res = await productManageClientService.getVariantsByProduct(record._id);
            const variantList = (res as any)?.data || (res as any)?.items || (res as any) || [];
            setEditVariants(Array.isArray(variantList) ? variantList : []);
        } catch {
            setEditVariants([]);
        } finally {
            setLoadingVariants(false);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            if (!editingProduct) return;

            // Update product info
            await updateProduct.mutateAsync({
                id: editingProduct._id,
                data: {
                    name: values.name,
                    status: values.status,
                    description: values.description,
                },
            });

            // Bulk update all variants (single API call)
            if (editVariants.length > 0) {
                setSavingVariants(true);
                await productManageClientService.bulkUpdateVariants(
                    editVariants.map((v) => ({
                        id: v._id,
                        data: {
                            price: v.price,
                            discount: v.discount,
                            stock: v.stock,
                            combination: v.combination,
                            sku: v.sku,
                        },
                    })),
                );
                setSavingVariants(false);
            }

            message.success("Cập nhật sản phẩm thành công!");
            setEditModalOpen(false);
            setEditingProduct(null);
            setEditVariants([]);
            refetch();
        } catch {
            setSavingVariants(false);
        }
    };

    const handleVariantFieldChange = useCallback(
        (variantId: string, field: string, value: number | string) => {
            setEditVariants((prev) =>
                prev.map((v) =>
                    v._id === variantId ? { ...v, [field]: value } : v,
                ),
            );
        },
        [],
    );

    const handleAddAttribute = () => {
        const key = newAttrKey.trim();
        const value = newAttrValue.trim();
        if (!key || !value) return;

        setEditVariants((prev) =>
            prev.map((v) => ({
                ...v,
                combination: { ...(v.combination || {}), [key]: value },
                sku: v.sku
                    ? `${v.sku}-${value.toLowerCase().replace(/[^a-z0-9]/gi, "")}`
                    : value.toLowerCase().replace(/[^a-z0-9]/gi, ""),
            })),
        );
        setNewAttrKey("");
        setNewAttrValue("");
        message.success(
            `Đã thêm thuộc tính "${key}: ${value}" cho tất cả ${editVariants.length} biến thể`,
        );
    };

    const handleRemoveAttribute = (attrKey: string) => {
        setEditVariants((prev) =>
            prev.map((v) => {
                const newCombo = { ...(v.combination || {}) };
                delete newCombo[attrKey];
                return { ...v, combination: newCombo };
            }),
        );
        message.info(`Đã xóa thuộc tính "${attrKey}" khỏi tất cả biến thể`);
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

    // =========== TABLE COLUMNS ===========
    const columns: ColumnsType<IProduct> = [
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
                const variants = variantsMap[record._id] || [];
                const allImages = variants.flatMap((v) => v.images || []);
                const img = allImages[0];
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
                        {loadingTableVariants ? <Spin size="small" /> : "No img"}
                    </div>
                );
            },
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            ellipsis: true,
            render: (name: string, record) => (
                <div>
                    <div className="font-medium text-sm line-clamp-1">{name}</div>
                    <div className="text-xs text-gray-400">{record.slug}</div>
                </div>
            ),
        },
        {
            title: "Giá",
            key: "price",
            width: 200,
            render: (_, record) => (
                <div>
                    <div className="font-semibold text-red-500 text-sm">
                        {formatCurrencyVND(record.minPrice || 0)}
                    </div>
                    {record.minPrice !== record.maxPrice && (
                        <div className="text-xs text-gray-500">
                            ~ {formatCurrencyVND(record.maxPrice || 0)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Tồn kho",
            key: "stock",
            width: 90,
            align: "center",
            render: (_, record) => {
                const variants = variantsMap[record._id] || [];
                const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                return (
                    <span className={`font-medium ${totalStock === 0 ? "text-red-500" : "text-green-600"}`}>
                        {loadingTableVariants ? <Spin size="small" /> : totalStock}
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

    // =========== All attribute keys from current variants ===========
    const existingAttrKeys = Array.from(
        new Set(editVariants.flatMap((v) => Object.keys(v.combination || {}))),
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold m-0">Sản phẩm đã đăng bán</h1>
                    <p className="text-gray-500 text-sm m-0 mt-1">
                        Quản lý các sản phẩm bạn đã đăng bán ({totalProducts} sản phẩm)
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

            {/* =========== EDIT MODAL =========== */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <EditOutlined className="text-blue-500" />
                        <span>Chỉnh sửa sản phẩm</span>
                    </div>
                }
                open={editModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditingProduct(null);
                    setEditVariants([]);
                }}
                confirmLoading={updateProduct.isPending || savingVariants}
                okText={<><SaveOutlined /> Lưu thay đổi</>}
                cancelText="Hủy"
                width={1000}
                styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
            >
                <Tabs
                    defaultActiveKey="info"
                    items={[
                        {
                            key: "info",
                            label: "Thông tin sản phẩm",
                            children: (
                                <Form form={editForm} layout="vertical" className="mt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Form.Item
                                            name="name"
                                            label="Tên sản phẩm"
                                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                                        >
                                            <Input placeholder="Tên sản phẩm" />
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
                                    </div>

                                    {/* Product summary from variants */}
                                    {editVariants.length > 0 && (
                                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                            <h4 className="font-medium mb-2 text-blue-700">Tổng quan</h4>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Giá min:</span>
                                                    <div className="font-semibold text-red-500">
                                                        {formatCurrencyVND(Math.min(...editVariants.map(v => v.price * (1 - (v.discount || 0) / 100))))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Giá max:</span>
                                                    <div className="font-semibold text-red-500">
                                                        {formatCurrencyVND(Math.max(...editVariants.map(v => v.price * (1 - (v.discount || 0) / 100))))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Tổng tồn kho:</span>
                                                    <div className="font-semibold text-green-600">
                                                        {editVariants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                                                    </div>
                                                </div>
                                            </div>
                                            {(() => {
                                                const allImages = editVariants.flatMap(v => v.images || []);
                                                return allImages.length > 0 ? (
                                                    <div className="mt-3">
                                                        <span className="text-gray-500 text-sm">Ảnh đại diện:</span>
                                                        <div className="flex gap-2 mt-1">
                                                            <Image
                                                                src={allImages[0]}
                                                                alt="Product"
                                                                width={64}
                                                                height={64}
                                                                style={{ objectFit: "cover", borderRadius: 6 }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    )}

                                    <Form.Item name="description" label="Mô tả sản phẩm">
                                        <RichTextEditor
                                            placeholder="Nhập mô tả sản phẩm..."
                                            minHeight={120}
                                        />
                                    </Form.Item>
                                </Form>
                            ),
                        },
                        {
                            key: "variants",
                            label: `Biến thể (${editVariants.length})`,
                            children: loadingVariants ? (
                                <div className="flex justify-center py-12">
                                    <Spin tip="Đang tải biến thể..." />
                                </div>
                            ) : editVariants.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">
                                    <InboxOutlined className="text-4xl mb-2" />
                                    <p>Không có biến thể nào</p>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    {/* ===== ADD ATTRIBUTE SECTION ===== */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium mb-3 text-gray-700 text-sm flex items-center gap-1.5">
                                            <PlusOutlined className="text-blue-500" />
                                            Thêm thuộc tính mới cho tất cả biến thể
                                        </h4>
                                        <div className="flex gap-3 items-end flex-wrap">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Tên thuộc tính</label>
                                                <Input
                                                    value={newAttrKey}
                                                    onChange={(e) => setNewAttrKey(e.target.value)}
                                                    placeholder="VD: Kích thước"
                                                    size="small"
                                                    className="!w-44"
                                                    onPressEnter={handleAddAttribute}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Giá trị</label>
                                                <Input
                                                    value={newAttrValue}
                                                    onChange={(e) => setNewAttrValue(e.target.value)}
                                                    placeholder="VD: 15.6 inch"
                                                    size="small"
                                                    className="!w-44"
                                                    onPressEnter={handleAddAttribute}
                                                />
                                            </div>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<PlusOutlined />}
                                                disabled={!newAttrKey.trim() || !newAttrValue.trim()}
                                                onClick={handleAddAttribute}
                                            >
                                                Thêm
                                            </Button>
                                        </div>

                                        {/* Existing attribute keys with remove */}
                                        {existingAttrKeys.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-xs text-gray-500">Thuộc tính hiện tại:</span>
                                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                                    {existingAttrKeys.map((key) => (
                                                        <Tag
                                                            key={key}
                                                            closable
                                                            onClose={() => handleRemoveAttribute(key)}
                                                            color="blue"
                                                            className="text-xs"
                                                        >
                                                            {key}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Divider className="!my-3" />

                                    {/* ===== VARIANTS TABLE ===== */}
                                    <Table
                                        dataSource={editVariants}
                                        rowKey="_id"
                                        pagination={false}
                                        size="small"
                                        scroll={{ x: 800 }}
                                        columns={[
                                            {
                                                title: "Ảnh",
                                                key: "image",
                                                width: 60,
                                                render: (_, v: IProductVariant) => {
                                                    const img = v.images?.[0];
                                                    return img ? (
                                                        <Image src={img} alt="variant" width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }} />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                            <PictureOutlined className="text-gray-300" />
                                                        </div>
                                                    );
                                                },
                                            },
                                            {
                                                title: "SKU",
                                                key: "sku",
                                                width: 140,
                                                render: (_, v: IProductVariant) => (
                                                    <Input
                                                        value={v.sku}
                                                        onChange={(e) => handleVariantFieldChange(v._id, "sku", e.target.value)}
                                                        size="small"
                                                        className="!text-xs !font-mono"
                                                    />
                                                ),
                                            },
                                            {
                                                title: "Thuộc tính",
                                                key: "combination",
                                                width: 180,
                                                render: (_, v: IProductVariant) => {
                                                    const combo = v.combination || {};
                                                    return Object.entries(combo).length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {Object.entries(combo).map(([key, val]) => (
                                                                <Tooltip key={key} title={key}>
                                                                    <Tag className="text-xs">{key}: {val}</Tag>
                                                                </Tooltip>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    );
                                                },
                                            },
                                            {
                                                title: "Giá (₫)",
                                                key: "price",
                                                width: 140,
                                                render: (_, v: IProductVariant) => (
                                                    <InputNumber
                                                        value={v.price}
                                                        min={0}
                                                        step={1000}
                                                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                        parser={(val) => Number(val?.replace(/,/g, "") || 0)}
                                                        onChange={(val) => handleVariantFieldChange(v._id, "price", val || 0)}
                                                        size="small"
                                                        className="w-full"
                                                    />
                                                ),
                                            },
                                            {
                                                title: "Giảm (%)",
                                                key: "discount",
                                                width: 90,
                                                render: (_, v: IProductVariant) => (
                                                    <InputNumber
                                                        value={v.discount}
                                                        min={0}
                                                        max={100}
                                                        onChange={(val) => handleVariantFieldChange(v._id, "discount", val || 0)}
                                                        size="small"
                                                        className="w-full"
                                                    />
                                                ),
                                            },
                                            {
                                                title: "Tồn kho",
                                                key: "stock",
                                                width: 90,
                                                render: (_, v: IProductVariant) => (
                                                    <InputNumber
                                                        value={v.stock}
                                                        min={0}
                                                        onChange={(val) => handleVariantFieldChange(v._id, "stock", val || 0)}
                                                        size="small"
                                                        className="w-full"
                                                    />
                                                ),
                                            },
                                            {
                                                title: "Giá sau giảm",
                                                key: "final",
                                                width: 120,
                                                render: (_, v: IProductVariant) => {
                                                    const finalPrice = v.price * (1 - (v.discount || 0) / 100);
                                                    return (
                                                        <span className="font-semibold text-red-500 text-xs">
                                                            {formatCurrencyVND(finalPrice)}
                                                        </span>
                                                    );
                                                },
                                            },
                                        ]}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </Modal>
        </div>
    );
}
