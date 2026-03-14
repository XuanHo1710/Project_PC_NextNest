"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
    Table, Input, Button, Tag, Space, Popconfirm, Image, Tooltip, Pagination,
    Modal, Form, Select, message, InputNumber, Spin, Tabs, Divider, Card, Badge,
    Drawer,
} from "antd";
import {
    SearchOutlined, EditOutlined, StopOutlined, EyeOutlined, ReloadOutlined,
    ShoppingOutlined, CheckCircleOutlined, CloseCircleOutlined, InboxOutlined,
    SaveOutlined, PictureOutlined, PlusOutlined, DeleteOutlined, TagsOutlined,
    ArrowLeftOutlined, ExpandOutlined, CloseOutlined, UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
    useMyProducts, useClientUpdateProduct, useClientRemoveProduct,
} from "@/hooks/client/useProductManage";
import { productManageClientService } from "@/services/client";
import { formatCurrencyVND } from "@/utils/productHelpers";
import type { IProduct, IProductVariant, IProductAttribute, IProductAttributeValue } from "@/types";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import RichTextEditor from "@/components/common/RichTextEditor";
import InfiniteSelect from "@/components/common/InfiniteSelect";
import { UploadImages } from "@/utils/uploadImage";

// ============ UTILITY ============
function cartesianProduct(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    return arrays.reduce<string[][]>(
        (acc, arr) => acc.flatMap((combo) => arr.map((val) => [...combo, val])),
        [[]],
    );
}

let _skuCounter = 0;
function generateSKU(combination: Record<string, string>): string {
    const parts = Object.values(combination).map((v) =>
        v.toUpperCase().replace(/[^A-Z0-9]/gi, "").slice(0, 8),
    );
    _skuCounter++;
    const suffix = `${Date.now().toString(36)}${_skuCounter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
    return `SKU-${parts.join("-")}-${suffix}`.slice(0, 50);
}

function comboKey(combo: Record<string, string>): string {
    return Object.entries(combo)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("|");
}

// ============ TYPES ============
interface AttrConfig {
    attrId: string;
    attrCode: string;
    attrName: string;
    displayType: string;
    values: string[];
}

export default function MyProductsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [editForm] = Form.useForm();
    const [editVariants, setEditVariants] = useState<IProductVariant[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [savingVariants, setSavingVariants] = useState(false);
    const [activeTab, setActiveTab] = useState("info");

    // Attribute management
    const [attrConfigs, setAttrConfigs] = useState<AttrConfig[]>([]);
    const [selectedAttribute, setSelectedAttribute] = useState<IProductAttribute | null>(null);
    const [selectedAttrValueLabel, setSelectedAttrValueLabel] = useState("");
    const [manualValue, setManualValue] = useState("");

    // Bulk apply
    const [bulkPrice, setBulkPrice] = useState<number | null>(null);
    const [bulkDiscount, setBulkDiscount] = useState<number | null>(null);
    const [bulkStock, setBulkStock] = useState<number | null>(null);

    // Variant detail drawer
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [detailVariant, setDetailVariant] = useState<IProductVariant | null>(null);
    const [detailForm] = Form.useForm();
    const [uploadingImages, setUploadingImages] = useState(false);

    const { data, isLoading, refetch } = useMyProducts(page, limit, search);
    const updateProduct = useClientUpdateProduct();
    const removeProduct = useClientRemoveProduct();

    const products = data?.data || [];
    const totalProducts = data?.pagination?.totalItems || 0;
    const activeCount = products.filter((p) => p.status === "ACTIVE").length;
    const inactiveCount = products.filter((p) => p.status === "INACTIVE").length;

    const outOfStockCount = products.filter((p) => (p.totalStock || 0) === 0).length;

    const handleSearch = () => { setSearch(searchInput); setPage(1); };

    // ============ REGENERATE VARIANTS ============
    const regenerateVariants = useCallback((configs: AttrConfig[], oldVariants: IProductVariant[]) => {
        // When no attributes or all values removed → empty table
        if (configs.length === 0 || configs.every((c) => c.values.length === 0)) {
            return [];
        }

        const keys = configs.map((c) => c.attrCode);
        const valueSets = configs.map((c) => c.values);
        const combos = cartesianProduct(valueSets);

        const oldLookup = new Map<string, IProductVariant>();
        oldVariants.forEach((v) => { oldLookup.set(comboKey(v.combination || {}), v); });

        const defaultVariant = oldVariants[0];
        return combos.map((valArray, idx) => {
            const combo: Record<string, string> = {};
            keys.forEach((k, i) => { combo[k] = valArray[i]; });
            const ck = comboKey(combo);
            const existing = oldLookup.get(ck);
            if (existing) return { ...existing, combination: combo };
            return {
                _id: `new_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                sku: generateSKU(combo),
                product: defaultVariant?.product || "",
                price: defaultVariant?.price || 0,
                discount: defaultVariant?.discount || 0,
                stock: defaultVariant?.stock || 0,
                images: defaultVariant?.images || [],
                subDescription: "",
                combination: combo,
            } as IProductVariant;
        });
    }, []);

    // ============ EDIT MODAL ============
    const handleEdit = async (record: IProduct) => {
        setEditingProduct(record);
        editForm.setFieldsValue({
            name: record.name,
            description: record.description || "",
            status: record.status,
        });
        setEditModalOpen(true);
        setActiveTab("info");
        setLoadingVariants(true);
        setSelectedAttribute(null);
        setSelectedAttrValueLabel("");
        setManualValue("");

        try {
            const res = await productManageClientService.getVariantsByProduct(record._id);
            const variantList = (res as any)?.data || (res as any)?.items || [];
            const variants = Array.isArray(variantList) ? variantList as IProductVariant[] : [];
            setEditVariants(variants);

            const attrMap = new Map<string, Set<string>>();
            variants.forEach((v) => {
                Object.entries(v.combination || {}).forEach(([key, val]) => {
                    if (!attrMap.has(key)) attrMap.set(key, new Set());
                    attrMap.get(key)!.add(val);
                });
            });
            const configs: AttrConfig[] = [];
            attrMap.forEach((valSet, key) => {
                configs.push({
                    attrId: key, attrCode: key, attrName: key,
                    displayType: "BUTTON", values: Array.from(valSet),
                });
            });
            setAttrConfigs(configs);
        } catch {
            setEditVariants([]);
            setAttrConfigs([]);
        } finally {
            setLoadingVariants(false);
        }
    };

    // ============ ADD ATTRIBUTE VALUE ============
    const handleAddAttributeValue = (valueOverride?: string) => {
        if (!selectedAttribute) return;
        const valueLabel = (valueOverride || selectedAttrValueLabel || manualValue).trim();
        if (!valueLabel) return;

        const code = selectedAttribute.code || selectedAttribute.name;

        setAttrConfigs((prev) => {
            const updated = [...prev];
            const existingIdx = updated.findIndex((c) => c.attrCode === code);

            if (existingIdx >= 0) {
                if (updated[existingIdx].values.includes(valueLabel)) {
                    message.warning(`"${valueLabel}" đã tồn tại trong "${updated[existingIdx].attrName}"`);
                    return prev;
                }
                updated[existingIdx] = {
                    ...updated[existingIdx],
                    values: [...updated[existingIdx].values, valueLabel],
                };
            } else {
                updated.push({
                    attrId: selectedAttribute._id,
                    attrCode: code,
                    attrName: selectedAttribute.name,
                    displayType: selectedAttribute.displayType || "BUTTON",
                    values: [valueLabel],
                });
            }

            const newVariants = regenerateVariants(updated, editVariants);
            setEditVariants(newVariants);
            message.success(`Thêm "${valueLabel}" → ${newVariants.length} biến thể`);
            return updated;
        });

        setSelectedAttrValueLabel("");
        setManualValue("");
    };

    const handleRemoveAttrValue = (attrCode: string, value: string) => {
        setAttrConfigs((prev) => {
            const updated = prev.map((c) =>
                c.attrCode === attrCode ? { ...c, values: c.values.filter((v) => v !== value) } : c,
            ).filter((c) => c.values.length > 0);
            const newVariants = regenerateVariants(updated, editVariants);
            setEditVariants(newVariants);
            return updated;
        });
    };

    const handleRemoveAttribute = (attrCode: string) => {
        setAttrConfigs((prev) => {
            const updated = prev.filter((c) => c.attrCode !== attrCode);
            const newVariants = regenerateVariants(updated, editVariants);
            setEditVariants(newVariants);
            return updated;
        });
        message.info("Đã xóa thuộc tính");
    };

    // ============ VARIANT DETAIL DRAWER ============
    const openVariantDetail = (variant: IProductVariant) => {
        setDetailVariant(variant);
        detailForm.setFieldsValue({
            sku: variant.sku,
            price: variant.price,
            discount: variant.discount || 0,
            stock: variant.stock || 0,
            subDescription: variant.subDescription || "",
        });
        setDetailDrawerOpen(true);
    };

    const handleSaveVariantDetail = () => {
        if (!detailVariant) return;
        const values = detailForm.getFieldsValue();
        setEditVariants((prev) =>
            prev.map((v) =>
                v._id === detailVariant._id
                    ? { ...v, sku: values.sku, price: values.price, discount: values.discount, stock: values.stock, subDescription: values.subDescription }
                    : v,
            ),
        );
        setDetailDrawerOpen(false);
        message.success("Đã cập nhật chi tiết biến thể");
    };

    const handleUploadFiles = async (files: File[]) => {
        if (!detailVariant || files.length === 0) return;
        setUploadingImages(true);
        try {
            const urls = await UploadImages(files);
            setEditVariants((prev) =>
                prev.map((v) =>
                    v._id === detailVariant._id ? { ...v, images: [...(v.images || []), ...urls] } : v,
                ),
            );
            setDetailVariant((prev) => prev ? { ...prev, images: [...(prev.images || []), ...urls] } : prev);
            message.success(`Đã tải lên ${urls.length} ảnh`);
        } catch {
            message.error("Tải ảnh thất bại, vui lòng thử lại");
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = (idx: number) => {
        if (!detailVariant) return;
        const newImages = (detailVariant.images || []).filter((_, i) => i !== idx);
        setEditVariants((prev) =>
            prev.map((v) => v._id === detailVariant._id ? { ...v, images: newImages } : v),
        );
        setDetailVariant((prev) => prev ? { ...prev, images: newImages } : prev);
    };

    // ============ SAVE ============
    const handleEditSubmit = async () => {
        try {
            const values = await editForm.validateFields();
            if (!editingProduct) return;

            await updateProduct.mutateAsync({
                id: editingProduct._id,
                data: {
                    name: values.name,
                    status: values.status,
                    description: values.description,
                },
            });

            if (editVariants.length > 0) {
                setSavingVariants(true);
                const variantsToSave = editVariants.map((v) => ({
                    sku: v.sku,
                    product: editingProduct._id,
                    price: v.price,
                    discount: v.discount || 0,
                    stock: v.stock || 0,
                    combination: v.combination,
                    images: v.images || [],
                    subDescription: v.subDescription || "",
                }));
                await productManageClientService.deleteAndRecreateVariants(
                    editingProduct._id,
                    variantsToSave,
                );
                setSavingVariants(false);
            }

            message.success("Cập nhật sản phẩm thành công!");
            setEditModalOpen(false);
            setEditingProduct(null);
            setEditVariants([]);
            setAttrConfigs([]);
            queryClient.invalidateQueries({ queryKey: ["client-my-products"] });
        } catch {
            setSavingVariants(false);
        }
    };

    const handleVariantFieldChange = useCallback(
        (variantId: string, field: string, value: number | string) => {
            setEditVariants((prev) =>
                prev.map((v) => v._id === variantId ? { ...v, [field]: value } : v),
            );
        }, [],
    );

    const handleBulkApply = (field: "price" | "discount" | "stock", value: number | null) => {
        if (value === null || value === undefined) return;
        setEditVariants((prev) => prev.map((v) => ({ ...v, [field]: value })));
        message.success(`Đã áp dụng ${field === "price" ? "giá" : field === "discount" ? "giảm giá" : "tồn kho"} cho ${editVariants.length} biến thể`);
    };

    const handleRemove = async (id: string) => { await removeProduct.mutateAsync(id); };

    // ============ INFINITE SELECT CALLBACKS ============
    const fetchAttributes = useCallback(
        (params: { page: number; limit: number; keyword?: string }) =>
            productManageClientService.getAttributes(params), [],
    );
    const mapAttribute = useCallback(
        (item: IProductAttribute) => ({
            label: `${item.name} (${item.code || item.name})`,
            value: item._id,
            raw: item,
        }), [],
    );
    const fetchAttributeValues = useCallback(
        (params: { page: number; limit: number; keyword?: string }) => {
            if (!selectedAttribute) return Promise.resolve({ data: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } });
            return productManageClientService.getAttributeValuesByAttribute(selectedAttribute._id).then((res) => {
                if (params.keyword) {
                    const kw = params.keyword.toLowerCase();
                    const filtered = (res.data || []).filter((v: IProductAttributeValue) =>
                        v.label?.toLowerCase().includes(kw) || v.value?.toLowerCase().includes(kw),
                    );
                    return { ...res, data: filtered };
                }
                return res;
            });
        }, [selectedAttribute],
    );
    const mapAttributeValue = useCallback(
        (item: IProductAttributeValue) => ({
            label: item.label, value: item.label, raw: item,
        }), [],
    );

    // ============ COMPUTED ============
    const getStatusTag = (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
            ACTIVE: { color: "green", text: "Đang bán" },
            INACTIVE: { color: "orange", text: "Ẩn" },
            STOPSOLD: { color: "red", text: "Ngừng bán" },
        };
        const s = map[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
    };

    const editSummary = useMemo(() => {
        if (editVariants.length === 0) return null;
        const prices = editVariants.map((v) => v.price * (1 - (v.discount || 0) / 100));
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            totalStock: editVariants.reduce((sum, v) => sum + (v.stock || 0), 0),
            thumbnail: editVariants.flatMap((v) => v.images || []).find(Boolean),
        };
    }, [editVariants]);

    // ============ TABLE COLUMNS ============
    const columns: ColumnsType<IProduct> = [
        { title: "#", key: "index", width: 50, render: (_, __, i) => (page - 1) * limit + i + 1 },
        {
            title: "Ảnh", key: "image", width: 70,
            render: (_, record) => {
                const img = record.thumbnail || record.defaultVariant?.images?.[0];
                return img ? (
                    <Image src={img} alt={record.name} width={50} height={50}
                        style={{ objectFit: "cover", borderRadius: 8 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div className="w-[50px] h-[50px] bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                        <PictureOutlined className="text-gray-300" />
                    </div>
                );
            },
        },
        {
            title: "Tên sản phẩm", dataIndex: "name", key: "name", ellipsis: true,
            render: (name: string, record) => (
                <div>
                    <div className="font-medium text-[13px] line-clamp-1">{name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{record.slug}</div>
                </div>
            ),
        },
        {
            title: "Giá", key: "price", width: 200,
            render: (_, record) => (
                <div className="text-[13px]">
                    <span className="font-semibold text-red-500">{formatCurrencyVND(record.maxPrice || 0)}</span>
                    {record.minPrice !== record.maxPrice && (
                        <span className="text-gray-400"> — <span className="text-red-500 font-semibold">{formatCurrencyVND(record.maxPrice || 0)}</span></span>
                    )}
                </div>
            ),
        },
        {
            title: "Tồn kho", key: "stock", width: 80, align: "center",
            render: (_, record) => {
                const total = record.totalStock || 0;
                return (
                    <Badge count={total} overflowCount={9999} showZero
                        style={{ backgroundColor: total === 0 ? "#ef4444" : "#22c55e", fontSize: 11 }} />
                );
            },
        },
        { title: "Trạng thái", dataIndex: "status", key: "status", width: 120, align: "center", render: (s: string) => getStatusTag(s) },
        {
            title: "", key: "action", width: 130, align: "center",
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Xem"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => router.push(`/product/${record.slug}`)} /></Tooltip>
                    <Tooltip title="Chỉnh sửa"><Button type="text" size="small" icon={<EditOutlined />} className="!text-blue-500" onClick={() => handleEdit(record)} /></Tooltip>
                    <Popconfirm title="Gỡ sản phẩm?" description="Sản phẩm sẽ ẩn khỏi trang." onConfirm={() => handleRemove(record._id)} okText="Gỡ" cancelText="Hủy" okButtonProps={{ danger: true, loading: removeProduct.isPending }}>
                        <Tooltip title="Gỡ"><Button type="text" size="small" icon={<StopOutlined />} className="!text-red-500" danger /></Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ============ RENDER ============
    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Back + Header */}
            <div className="mb-6">
                <Button
                    type="text" icon={<ArrowLeftOutlined />}
                    onClick={() => router.back()}
                    className="!text-gray-500 hover:!text-blue-500 !px-0 !mb-2"
                >
                    Quay lại
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold m-0">Sản phẩm của tôi</h1>
                        <p className="text-gray-400 text-sm m-0 mt-0.5">{totalProducts} sản phẩm đã đăng bán</p>
                    </div>
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Làm mới</Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { icon: <ShoppingOutlined className="text-lg" />, label: "Tổng cộng", value: totalProducts, bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
                    { icon: <CheckCircleOutlined className="text-lg" />, label: "Đang bán", value: activeCount, bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
                    { icon: <CloseCircleOutlined className="text-lg" />, label: "Đang ẩn", value: inactiveCount, bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
                    { icon: <InboxOutlined className="text-lg" />, label: "Hết hàng", value: outOfStockCount, bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl border ${s.border} p-4 flex items-center gap-3 transition-shadow hover:shadow-sm`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.text} bg-white shadow-sm`}>{s.icon}</div>
                        <div>
                            <p className="text-[11px] text-gray-400 m-0 uppercase tracking-wide">{s.label}</p>
                            <p className={`text-xl font-bold m-0 ${s.text}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="mb-4">
                <Input.Search
                    placeholder="Tìm kiếm theo tên sản phẩm..."
                    value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={handleSearch} onPressEnter={handleSearch}
                    enterButton={<SearchOutlined />} style={{ maxWidth: 420 }} allowClear size="large"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <Table columns={columns} dataSource={products} loading={isLoading} rowKey="_id" pagination={false} scroll={{ x: 800 }} size="middle" />
            </div>

            {totalProducts > limit && (
                <div className="flex justify-end mt-4">
                    <Pagination current={page} total={totalProducts} pageSize={limit} onChange={(p) => setPage(p)} showTotal={(t) => `Tổng ${t}`} showSizeChanger={false} />
                </div>
            )}

            {/* ===================== EDIT MODAL ===================== */}
            <Modal
                title={
                    <div className="flex items-center gap-2.5 pb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <EditOutlined className="text-blue-500" />
                        </div>
                        <div>
                            <div className="font-semibold text-base leading-tight">Chỉnh sửa sản phẩm</div>
                            <div className="text-xs text-gray-400 font-normal">{editingProduct?.name}</div>
                        </div>
                    </div>
                }
                open={editModalOpen}
                onCancel={() => { setEditModalOpen(false); setEditingProduct(null); setEditVariants([]); setAttrConfigs([]); setBulkPrice(null); setBulkDiscount(null); setBulkStock(null); }}
                width={1200}
                centered
                styles={{ body: { maxHeight: "78vh", overflowY: "auto", padding: "12px 24px" } }}
                footer={
                    <div className="flex items-center justify-between pt-2 border-t">
                        <Button onClick={() => { setEditModalOpen(false); setEditingProduct(null); }}>Hủy</Button>
                        <Button
                            type="primary" size="large" icon={<SaveOutlined />}
                            loading={updateProduct.isPending || savingVariants}
                            onClick={handleEditSubmit}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                }
            >
                <Tabs
                    activeKey={activeTab} onChange={setActiveTab}
                    items={[
                        // ===== TAB: INFO =====
                        {
                            key: "info",
                            label: "Thông tin",
                            children: (
                                <div className="space-y-5 mt-3">
                                    <Form form={editForm} layout="vertical" requiredMark={false}>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3">
                                                <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                                                    <Input placeholder="Nhập tên sản phẩm..." size="large" />
                                                </Form.Item>
                                            </div>
                                            <div>
                                                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                                                    <Select size="large" options={[
                                                        { value: "ACTIVE", label: "Đang bán" },
                                                        { value: "INACTIVE", label: "Ẩn" },
                                                    ]} />
                                                </Form.Item>
                                            </div>
                                        </div>
                                        <Form.Item name="description" label="Mô tả sản phẩm">
                                            <RichTextEditor placeholder="Nhập mô tả chi tiết sản phẩm..." minHeight={150} />
                                        </Form.Item>
                                    </Form>

                                    {editSummary && (
                                        <div className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TagsOutlined className="text-blue-600" />
                                                <span className="font-semibold text-sm text-gray-700">Tổng quan biến thể</span>
                                                <Badge count={editVariants.length} style={{ backgroundColor: "#3b82f6" }} />
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <div className="text-[11px] text-gray-400 uppercase tracking-wide">Giá thấp nhất</div>
                                                    <div className="font-bold text-red-500 text-base mt-0.5">{formatCurrencyVND(editSummary.minPrice)}</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <div className="text-[11px] text-gray-400 uppercase tracking-wide">Giá cao nhất</div>
                                                    <div className="font-bold text-red-500 text-base mt-0.5">{formatCurrencyVND(editSummary.maxPrice)}</div>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <div className="text-[11px] text-gray-400 uppercase tracking-wide">Tổng tồn kho</div>
                                                    <div className="font-bold text-green-600 text-base mt-0.5">{editSummary.totalStock}</div>
                                                </div>
                                                {editSummary.thumbnail && (
                                                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                        <div className="text-[11px] text-gray-400 uppercase tracking-wide">Ảnh đại diện</div>
                                                        <Image src={editSummary.thumbnail} alt="" width={44} height={44}
                                                            style={{ objectFit: "cover", borderRadius: 6, marginTop: 4 }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                        // ===== TAB: VARIANTS =====
                        {
                            key: "variants",
                            label: `Biến thể (${editVariants.length})`,
                            children: loadingVariants ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Spin size="large" />
                                    <span className="text-gray-400">Đang tải biến thể...</span>
                                </div>
                            ) : (
                                <div className="space-y-5 mt-3">
                                    {/* ======= ATTRIBUTE BUILDER ======= */}
                                    <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <PlusOutlined className="text-blue-500" />
                                            <span className="font-semibold text-gray-700">Quản lý thuộc tính</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-4 ml-6">
                                            Chọn thuộc tính rồi thêm giá trị. Hệ thống tự sinh tổ hợp biến thể (tích Descartes).
                                        </p>

                                        {/* Attribute selector */}
                                        <div className="bg-white rounded-lg border p-4 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                                <div className="md:col-span-5">
                                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">Thuộc tính</label>
                                                    <InfiniteSelect
                                                        fetchFn={fetchAttributes}
                                                        mapOption={mapAttribute}
                                                        queryKeyPrefix="edit-attr-select"
                                                        placeholder="Chọn thuộc tính..."
                                                        value={selectedAttribute?._id || undefined}
                                                        onChange={() => { setSelectedAttrValueLabel(""); setManualValue(""); }}
                                                        onSelect={(_: string, option: any) => {
                                                            if (option?.raw) setSelectedAttribute(option.raw);
                                                        }}
                                                        size="large"
                                                        className="w-full"
                                                        pageSize={15}
                                                        emptyText="Không tìm thấy"
                                                        allowClear
                                                        onClear={() => { setSelectedAttribute(null); setSelectedAttrValueLabel(""); setManualValue(""); }}
                                                    />
                                                </div>

                                                <div className="md:col-span-5">
                                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">
                                                        Giá trị {selectedAttribute && <span className="text-blue-500">({selectedAttribute.name})</span>}
                                                    </label>
                                                    {selectedAttribute ? (
                                                        <InfiniteSelect
                                                            fetchFn={fetchAttributeValues}
                                                            mapOption={mapAttributeValue}
                                                            queryKeyPrefix={`edit-attr-val-${selectedAttribute._id}`}
                                                            placeholder="Chọn từ danh sách..."
                                                            value={selectedAttrValueLabel || undefined}
                                                            onChange={(val: string) => { setSelectedAttrValueLabel(val); setManualValue(""); }}
                                                            size="large"
                                                            className="w-full"
                                                            pageSize={20}
                                                            emptyText="Không có sẵn"
                                                            allowClear
                                                        />
                                                    ) : (
                                                        <Input disabled placeholder="Chọn thuộc tính trước..." size="large" />
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <Button
                                                        type="primary" size="large" icon={<PlusOutlined />}
                                                        disabled={!selectedAttribute || !(selectedAttrValueLabel || manualValue).trim()}
                                                        onClick={() => handleAddAttributeValue()}
                                                        className="w-full"
                                                    >
                                                        Thêm
                                                    </Button>
                                                </div>
                                            </div>

                                            {selectedAttribute && (
                                                <div className="mt-3 flex gap-2 items-center">
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">Hoặc nhập thủ công:</span>
                                                    <Input
                                                        size="middle"
                                                        placeholder={`Nhập giá trị ${selectedAttribute.name}...`}
                                                        value={manualValue}
                                                        onChange={(e) => { setManualValue(e.target.value); setSelectedAttrValueLabel(""); }}
                                                        onPressEnter={() => handleAddAttributeValue(manualValue)}
                                                        className="flex-1 max-w-xs"
                                                    />
                                                    {manualValue.trim() && (
                                                        <Button type="link" size="small" icon={<PlusOutlined />}
                                                            onClick={() => handleAddAttributeValue(manualValue)}>
                                                            Thêm &quot;{manualValue}&quot;
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Current attributes */}
                                        {attrConfigs.length > 0 && (
                                            <div className="space-y-2">
                                                {attrConfigs.map((cfg) => (
                                                    <div key={cfg.attrCode}
                                                        className="bg-white rounded-lg border p-3 flex items-center gap-3 group hover:border-blue-200 transition-colors"
                                                    >
                                                        <div className="min-w-[110px] shrink-0">
                                                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-md px-2 py-1 text-xs font-semibold">
                                                                {cfg.attrName}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5 pl-0.5 font-mono">{cfg.attrCode}</div>
                                                        </div>
                                                        <div className="flex-1 flex flex-wrap gap-1.5">
                                                            {cfg.values.map((val) => (
                                                                <Tag
                                                                    key={val} closable
                                                                    onClose={() => handleRemoveAttrValue(cfg.attrCode, val)}
                                                                    className="!m-0 !rounded-md !text-xs !border-blue-200 !bg-blue-50 !text-blue-700"
                                                                >
                                                                    {val}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                        <Tooltip title="Xóa thuộc tính">
                                                            <Button type="text" size="small" danger
                                                                icon={<DeleteOutlined />}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleRemoveAttribute(cfg.attrCode)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                ))}

                                                <div className="text-xs text-gray-400 pt-1 pl-1">
                                                    Tổ hợp: {attrConfigs.map((c) => c.values.length).join(" × ")} = <strong className="text-blue-600">{editVariants.length}</strong> biến thể
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ======= BULK APPLY ======= */}
                                    {editVariants.length > 1 && (
                                        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TagsOutlined className="text-blue-500" />
                                                <span className="font-semibold text-sm text-gray-700">Áp dụng hàng loạt</span>
                                                <span className="text-[11px] text-gray-400">cho tất cả {editVariants.length} biến thể</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[11px] text-gray-500 mb-1 block">Giá (₫)</label>
                                                        <InputNumber
                                                            value={bulkPrice}
                                                            onChange={(v) => setBulkPrice(v)}
                                                            min={0} step={10000}
                                                            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                            parser={(val) => Number(val?.replace(/,/g, "") || 0) as any}
                                                            placeholder="VD: 500,000"
                                                            className="!w-full" size="middle"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="primary" size="middle"
                                                        disabled={bulkPrice === null}
                                                        onClick={() => { handleBulkApply("price", bulkPrice); setBulkPrice(null); }}
                                                        className="!mt-[18px]"
                                                    >
                                                        Áp dụng
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[11px] text-gray-500 mb-1 block">Giảm giá (%)</label>
                                                        <InputNumber
                                                            value={bulkDiscount}
                                                            onChange={(v) => setBulkDiscount(v)}
                                                            min={0} max={100}
                                                            placeholder="VD: 10"
                                                            className="!w-full" size="middle"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="primary" size="middle"
                                                        disabled={bulkDiscount === null}
                                                        onClick={() => { handleBulkApply("discount", bulkDiscount); setBulkDiscount(null); }}
                                                        className="!mt-[18px]"
                                                    >
                                                        Áp dụng
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[11px] text-gray-500 mb-1 block">Tồn kho</label>
                                                        <InputNumber
                                                            value={bulkStock}
                                                            onChange={(v) => setBulkStock(v)}
                                                            min={0}
                                                            placeholder="VD: 100"
                                                            className="!w-full" size="middle"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="primary" size="middle"
                                                        disabled={bulkStock === null}
                                                        onClick={() => { handleBulkApply("stock", bulkStock); setBulkStock(null); }}
                                                        className="!mt-[18px]"
                                                    >
                                                        Áp dụng
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ======= VARIANTS TABLE ======= */}
                                    {editVariants.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <InboxOutlined className="text-4xl text-gray-300 mb-3" />
                                            <p className="text-gray-400 m-0">Thêm thuộc tính và giá trị để sinh biến thể</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border overflow-hidden">
                                            <Table
                                                dataSource={editVariants}
                                                rowKey="_id"
                                                pagination={editVariants.length > 8 ? { pageSize: 8, size: "small", showSizeChanger: false } : false}
                                                size="small"
                                                scroll={{ x: 950 }}
                                                columns={[
                                                    {
                                                        title: "Ảnh", key: "image", width: 55, fixed: "left",
                                                        render: (_, v: IProductVariant) => {
                                                            const img = v.images?.[0];
                                                            return img
                                                                ? <Image src={img} alt="" width={40} height={40} style={{ objectFit: "cover", borderRadius: 6 }} />
                                                                : <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center border border-dashed border-gray-200"><PictureOutlined className="text-gray-300 text-xs" /></div>;
                                                        },
                                                    },
                                                    {
                                                        title: "SKU", key: "sku", width: 170,
                                                        render: (_, v: IProductVariant) => (
                                                            <Input value={v.sku} onChange={(e) => handleVariantFieldChange(v._id, "sku", e.target.value)}
                                                                size="small" className="!text-xs !font-mono" variant="borderless" />
                                                        ),
                                                    },
                                                    {
                                                        title: "Thuộc tính", key: "combination", width: 220,
                                                        render: (_, v: IProductVariant) => {
                                                            const combo = v.combination || {};
                                                            return Object.entries(combo).length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {Object.entries(combo).map(([key, val]) => (
                                                                        <span key={key} className="inline-flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px]">
                                                                            <span className="text-gray-400">{key}:</span>
                                                                            <span className="font-medium text-gray-700">{val}</span>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : <span className="text-gray-300 text-xs">—</span>;
                                                        },
                                                    },
                                                    {
                                                        title: "Giá (₫)", key: "price", width: 140,
                                                        render: (_, v: IProductVariant) => (
                                                            <InputNumber value={v.price} min={0} step={10000}
                                                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                                parser={(val) => Number(val?.replace(/,/g, "") || 0)}
                                                                onChange={(val) => handleVariantFieldChange(v._id, "price", val || 0)}
                                                                size="small" className="w-full" variant="borderless"
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        title: "Giảm %", key: "discount", width: 80,
                                                        render: (_, v: IProductVariant) => (
                                                            <InputNumber value={v.discount} min={0} max={100}
                                                                onChange={(val) => handleVariantFieldChange(v._id, "discount", val || 0)}
                                                                size="small" className="w-full" variant="borderless" />
                                                        ),
                                                    },
                                                    {
                                                        title: "Kho", key: "stock", width: 70,
                                                        render: (_, v: IProductVariant) => (
                                                            <InputNumber value={v.stock} min={0}
                                                                onChange={(val) => handleVariantFieldChange(v._id, "stock", val || 0)}
                                                                size="small" className="w-full" variant="borderless" />
                                                        ),
                                                    },
                                                    {
                                                        title: "Sau giảm", key: "final", width: 110, align: "right",
                                                        render: (_, v: IProductVariant) => (
                                                            <span className="font-semibold text-red-500 text-xs whitespace-nowrap">
                                                                {formatCurrencyVND(v.price * (1 - (v.discount || 0) / 100))}
                                                            </span>
                                                        ),
                                                    },
                                                    {
                                                        title: "", key: "actions", width: 50, align: "center", fixed: "right",
                                                        render: (_, v: IProductVariant) => (
                                                            <Tooltip title="Chi tiết">
                                                                <Button
                                                                    type="text" size="small"
                                                                    icon={<ExpandOutlined />}
                                                                    className="!text-blue-500 hover:!bg-blue-50"
                                                                    onClick={() => openVariantDetail(v)}
                                                                />
                                                            </Tooltip>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />
            </Modal>

            {/* ===================== VARIANT DETAIL DRAWER ===================== */}
            <Drawer
                title={
                    <div>
                        <div className="font-semibold text-sm">Chi tiết biến thể</div>
                        <div className="text-[11px] text-gray-400 font-normal font-mono">{detailVariant?.sku || "—"}</div>
                    </div>
                }
                placement="right"
                width={520}
                open={detailDrawerOpen}
                onClose={() => setDetailDrawerOpen(false)}
                extra={
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveVariantDetail}>
                        Lưu
                    </Button>
                }
            >
                {detailVariant && (
                    <div className="space-y-5">
                        {/* Combination display */}
                        <div className="rounded-lg bg-slate-50 border p-3">
                            <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">Tổ hợp thuộc tính</div>
                            <div className="flex flex-wrap gap-1.5">
                                {Object.entries(detailVariant.combination || {}).map(([k, v]) => (
                                    <span key={k} className="inline-flex items-center gap-1 bg-white border border-blue-200 rounded-md px-2 py-1 text-xs">
                                        <span className="text-blue-500 font-medium">{k}:</span>
                                        <span className="text-gray-700">{v}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <Form form={detailForm} layout="vertical" requiredMark={false}>
                            <div className="grid grid-cols-2 gap-3">
                                <Form.Item name="sku" label="SKU" className="col-span-2">
                                    <Input size="large" className="!font-mono" />
                                </Form.Item>
                                <Form.Item name="price" label="Giá (₫)">
                                    <InputNumber size="large" min={0} step={10000} className="!w-full"
                                        formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(val) => Number(val?.replace(/,/g, "") || 0) as any} />
                                </Form.Item>
                                <Form.Item name="discount" label="Giảm giá (%)">
                                    <InputNumber size="large" min={0} max={100} className="!w-full" />
                                </Form.Item>
                                <Form.Item name="stock" label="Tồn kho" className="col-span-2">
                                    <InputNumber size="large" min={0} className="!w-full" />
                                </Form.Item>
                            </div>

                            <Divider className="!my-3" />

                            <Form.Item name="subDescription" label="Mô tả biến thể">
                                <Input.TextArea rows={4} placeholder="Mô tả riêng cho biến thể này..." className="!resize-none" />
                            </Form.Item>
                        </Form>

                        <Divider className="!my-3" />

                        {/* Images */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-sm">
                                    Hình ảnh ({(detailVariant.images || []).length})
                                </span>
                            </div>

                            {/* Image grid */}
                            {(detailVariant.images || []).length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {(detailVariant.images || []).map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                                            <Image src={img} alt={`img-${idx}`} width="100%" height="100%"
                                                style={{ objectFit: "cover" }}
                                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                                            />
                                            <button
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                                                onClick={() => handleRemoveImage(idx)}
                                            >
                                                <CloseOutlined />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload images via Cloudinary */}
                            <input
                                ref={imageInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) handleUploadFiles(files);
                                    if (imageInputRef.current) imageInputRef.current.value = "";
                                }}
                            />
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                                onClick={() => !uploadingImages && imageInputRef.current?.click()}
                            >
                                {uploadingImages ? (
                                    <div>
                                        <Spin />
                                        <p className="text-xs text-gray-400 mt-2 mb-0">Đang tải ảnh lên Cloudinary...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <UploadOutlined className="text-2xl text-gray-300" />
                                        <p className="text-sm text-gray-500 mt-1 mb-0">Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5 mb-0">Hỗ trợ JPG, PNG, WEBP (tối đa 20MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price preview */}
                        <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-3 mt-4">
                            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Giá sau giảm</div>
                            <div className="text-xl font-bold text-red-500 mt-0.5">
                                {formatCurrencyVND(
                                    (detailForm.getFieldValue("price") || detailVariant.price) *
                                    (1 - ((detailForm.getFieldValue("discount") || detailVariant.discount || 0) / 100))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
