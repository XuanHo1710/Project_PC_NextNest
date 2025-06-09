'use client'
import ActionProduct from "@/components/ActionFilter/product/ActionProduct";
import FilterProduct from "@/components/ActionFilter/product/FilterProduct";
import ContentModalProduct from "@/components/ContentModal/product/ContentModalProduct";
import UpdateModalProduct from "@/components/ContentModal/product/UpdateModalProduct";
import EditSortProduct from "@/components/EditSort/product/EditSortProduct";
import TableContent from "@/components/TableContent/TableContent";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import { IProduct, useProductStore } from "@/stores/productStore";
import { Image, Modal, Popconfirm, Spin, Tag } from "antd";
import { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useEffect, useState } from "react";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";



export interface DataType extends IProduct {
    key: string;
}

type SelectedContextType = {
    selectedRows: Array<string>;
    setSelectedRows: React.Dispatch<React.SetStateAction<Array<string>>>;
};

const SelectedProductContext = createContext<SelectedContextType | undefined>(undefined);


export default function Product() {
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "name",
        "images",
        "oldPrice",
        "stock",
        "soldCount",
        "description",
        "other",
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
                toast.success("Xóa nhân viên này thành công !!");
        } catch (err) {
            toast.error("Xóa nhân viên này thất bại do lỗi: " + err);
        }
    }



    const columns: ColumnsType<DataType> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
                width: 300,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "images") {
                columnConfig.render = (_: unknown, { name, images }: { name: string, images: Array<string> }) => (
                    <div className="flex items-center gap-4">
                        <Image src={images[0]} alt={name} />
                        <h2 className="text-md">{name}</h2>
                    </div>
                );
            } else if (field === "discount") {
                columnConfig.render = (_: unknown, { discount }: { discount: number }) => (
                    <Tag color="cyan">{discount * 100} %</Tag>
                );
            } else if (field === "oldPrice") {
                columnConfig.render = (_: unknown, { oldPrice }: { oldPrice: number }) => (
                    <h2>{oldPrice.toLocaleString()} VND</h2>
                );
            } else if (field === "position") {
                columnConfig.render = (_: unknown, { position }: { position: number }) => (
                    <Tag color="blue">{position}</Tag>
                );
            }
            else if (field === "feature") {
                columnConfig.render = (_: unknown, { feature }: { feature: boolean }) => (
                    <h2>{feature ? "Có" : "Không"}</h2>
                );
            } else if (field === "newPrice") {
                columnConfig.render = (_: unknown, record: DataType) => (
                    <h2>{record.newPrice !== undefined ? record.newPrice.toLocaleString() + " VND" : "N/A"}</h2>
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
                    <FaPen
                        onClick={() => {
                            setOpen(true);
                            setDataClick(record);
                        }}
                        className='hover:text-blue-500 cursor-pointer'
                    />
                    <Popconfirm
                        title="Xóa dòng của bạn"
                        description="Bạn có chắc chắn muốn xóa dòng này ?"
                        onConfirm={() => handleDelete(record._id as string)}
                        okText="Xóa"
                        cancelText="Không"
                    >
                        <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    let dataTable: DataType[] = [];
    if (!loading && products.length > 0) {
        dataTable = products.map((item, index) => {
            const row = {
                key: index.toString(),
                _id: item._id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...fields.reduce((acc: any, field: any) => {
                    if (item.hasOwnProperty(field)) {
                        acc[field] = item[field as keyof IProduct];
                    }
                    return acc;
                }, {}),
            };
            return row as DataType;
        });
    }


    return (
        <>
            <SelectedProductContext.Provider value={{ selectedRows, setSelectedRows }} >
                <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                    <UpdateModalProduct setOpen={setOpen} dataProduct={dataClick} />
                </Modal>
                <div className="py-2">
                    <h2 className="text-center text-2xl font-bold">Trang sản phẩm</h2>
                    <ActionProduct ConfigFields={{ fields, setFields }} Filter={<FilterProduct />} EditSort={<EditSortProduct />} ContentModal={<ContentModalProduct />}></ActionProduct>
                    <Spin size="large" spinning={loading}>
                        <TableContent<DataType> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                    </Spin>
                </div>
            </SelectedProductContext.Provider>
        </>
    );
}


// Custom hook để dùng trong các component khác
export const useSelectedRowsProduct = () => {
    const context = useContext(SelectedProductContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong ProductContext");
    }
    return context;
};
