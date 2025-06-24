'use client'
import ActionProduct from "@/components/ActionFilter/product/ActionProduct";
import FilterProduct from "@/components/ActionFilter/product/FilterProduct";
import ContentModalProduct from "@/components/ContentModal/product/ContentModalProduct";
import UpdateModalProduct from "@/components/ContentModal/product/UpdateModalProduct";
import EditSortProduct from "@/components/EditSort/product/EditSortProduct";
import TableContent from "@/components/TableContent/TableContent";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { useProductStore } from "@/stores/productStore";
import { ICategory, IProduct } from "@/types/modal.d";
import { DataType, SelectedContextType } from "@/types/table.d";
import { Image, Modal, Popconfirm, Spin, Tag } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useEffect, useState } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";


const SelectedProductContext = createContext<SelectedContextType | undefined>(undefined);


export default function ContentProduct() {
    const [isOpen, setOpen] = useState(false);
    const { accountLogin } = useAuthEmployee();
    const [dataClick, setDataClick] = useState<null | DataType<IProduct>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "name",
        "images",
        "category",
        "oldPrice",
        "stock",
        "soldCount",
        "status",
        "position",
        "feature",
        "discount",
        "newPrice"
    ]);

    // createdBy
    // updateBy

    const { products, deleteProduct, fetchProducts, loading } = useProductStore()


    useEffect(() => {
        fetchProducts("?" + queryParams.toString() as string)
    }, [fetchProducts, queryParams]);


    const handleDelete = async (id: string) => {
        try {
            const status = await deleteProduct(id);
            if (status !== 500)
                toast.success("Xóa sản phẩm này thành công !!");
        } catch (err) {
            toast.error("Xóa sản phẩm này thất bại do lỗi: " + err);
        }
    }



    const columns: ColumnsType<DataType<IProduct>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IProduct>> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
                width: 3600,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "images") {
                columnConfig.render = (_: unknown, { name, images }: { name: string, images: Array<string> }) => (
                    <div className="flex items-center gap-4">
                        <Image src={images.length > 0 ? images[0] : ""} alt={name} />
                    </div>
                );
            } else if (field === "discount") {
                columnConfig.render = (_: unknown, { discount }: { discount: number }) => (
                    <Tag color="cyan">{discount * 100} %</Tag>
                );
            } else if (field === "oldPrice") {
                columnConfig.render = (_: unknown, { oldPrice }: { oldPrice: number }) => (
                    <Tag color="blue">{oldPrice.toLocaleString()} VND</Tag>
                );
            } else if (field === "position") {
                columnConfig.render = (_: unknown, { position }: { position: number }) => (
                    <Tag color="blue">{position}</Tag>
                );
            }
            else if (field === "feature") {
                columnConfig.render = (_: unknown, { feature }: { feature: boolean }) => (
                    <Tag color="gold">{feature ? "Có" : "Không"}</Tag>
                );
            } else if (field === "newPrice") {
                columnConfig.render = (_: unknown, record: DataType<IProduct>) => (
                    <Tag color="blue">{record.newPrice !== undefined ? record.newPrice.toLocaleString() + " VND" : "N/A"}</Tag>
                );
            } else if (field === "category") {
                columnConfig.render = (_: unknown, { category }: { category: ICategory }) => (
                    <div>{category.name}</div>
                );
            } else if (field === "status") {
                columnConfig.render = (_: unknown, { status }: { status: string }) => {
                    if (status === "ACTIVE")
                        return <Tag color="green">Hoạt động</Tag>
                    else if (status === "INACTIVE")
                        return <Tag color="red">Dừng hoạt động</Tag>
                    else if (status === "STOPSOLD")
                        return <Tag color="cyan">Ngưng bán</Tag>
                };
            } else if (field === "stock") {
                columnConfig.render = (_: unknown, { stock }: { stock: number }) => (
                    <Tag color="geekblue">{stock}</Tag>
                );
            } else if (field === "soldCount") {
                columnConfig.render = (_: unknown, record: DataType<IProduct>) => (
                    <Tag color="geekblue">{record.soldCount}</Tag>
                );
            }


            return columnConfig;
        }),
        // Cột action luôn xuất hiện
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role.permission.some(
                        (p) => p.method === "PATCH" && p.path === "/api/v1/admin/product/:id"
                    ) &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                        />
                    }
                    {accountLogin && accountLogin.role.permission.some(
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/product/:id"
                    ) &&
                        <Popconfirm
                            title="Xóa dòng của bạn"
                            description="Bạn có chắc chắn muốn xóa dòng này ?"
                            onConfirm={() => handleDelete(record._id as string)}
                            okText="Xóa"
                            cancelText="Không"
                        >
                            <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                        </Popconfirm>
                    }
                </div>
            ),
        },
    ];


    let dataTable: DataType<IProduct>[] = [];
    if (!loading && products.length > 0 && accountLogin && accountLogin.role.permission.some(
        (p) => p.method === "GET" && p.path === "/api/v1/admin/product"
    )) {
        dataTable = products.map((item, index) => {
            const row = {
                key: index.toString(),
                _id: item._id,
                otherString: item.other.map((o, index) => {
                    if (item.other.length - 1 === index) {
                        return o.key + ":" + o.value;
                    }
                    return o.key + ":" + o.value + ";"
                }).join(""),
                description: item.description,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...fields.reduce((acc: any, field: any) => {
                    if (item.hasOwnProperty(field)) {
                        acc[field] = item[field as keyof IProduct];
                    }
                    return acc;
                }, {}),
            };
            return row as DataType<IProduct>;
        });
    }

    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {accountLogin && accountLogin.role.permission.some(
                    (p) => p.method === "PATCH" && p.path === "/api/v1/admin/product/:id"
                ) &&
                    <UpdateModalProduct setOpen={setOpen} dataProduct={dataClick} />
                }
            </Modal>
            <SelectedProductContext.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionProduct ConfigFields={{ fields, setFields }} Filter={<FilterProduct />} EditSort={<EditSortProduct />} ContentModal={<ContentModalProduct />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IProduct>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedProductContext.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsProduct = () => {
    const context = useContext(SelectedProductContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong ProductContext");
    }
    return context;
};