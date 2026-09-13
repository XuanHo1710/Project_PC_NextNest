'use client'
import { Modal, Spin, Tag } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { createContext, useContext, useState } from "react";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import UpdateModalDiscount from "@/components/ContentModal/discount/UpdateModalDiscount";
import ActionDiscount from "@/components/ActionFilter/discount/ActionDiscount";
import FilterDiscount from "@/components/ActionFilter/discount/FilterDiscount";
import EditSortDiscount from "@/components/EditSort/discount/EditSortDiscount";
import ContentModalDiscount from "@/components/ContentModal/discount/ContentModalDiscount";
import ConfirmDeletePopconfirm from "@/components/common/ConfirmDeletePopconfirm";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IDiscount } from "@/types/discount";
import { useDiscounts, useDeleteDiscount } from "@/hooks/admin";
import { useHasPermission } from "@/hooks/admin/useHasPermission";




const SelectedDiscountContext = createContext<SelectedContextType | undefined>(undefined);

export default function ContentDiscount() {

    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType<IDiscount>>(null);
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "name",
        "description",
        "status",
        "type",
        "startDate",
        "endDate",
        "valueDiscount",
    ]);

    // Use TanStack Query hooks
    const {
        data: discountsResult,
        isLoading: loading
    } = useDiscounts(queryParams.toString());

    const discounts = discountsResult?.data ?? [];

    const deleteDiscount = useDeleteDiscount();
    const hasPermission = useHasPermission();

    // Hard delete: discount is removed via service.delete().
    const handleDelete = async (id: string) => {
        try {
            await deleteDiscount.mutateAsync(id);
        } catch (err) {
            // Error handling is done in the hook
            console.error('Delete failed:', err);
        }
    }



    const columns: ColumnsType<DataType<IDiscount>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IDiscount>> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "type") {
                columnConfig.render = (_: unknown, { type }: { type: string | boolean }) => (
                    <Tag color="cyan">{type === "PERCENT" ? "Phần trăm" : "Tiền"}</Tag>
                );
            } else if (field === "startDate") {
                columnConfig.render = (_: unknown, { startDate }: { startDate: string }) => (
                    <h3>{startDate.split("T")[0]}</h3>
                );
            } else if (field === "endDate") {
                columnConfig.render = (_: unknown, { endDate }: { endDate: string }) => (
                    <h3>{endDate.split("T")[0]}</h3>
                );
            } else if (field === "valueDiscount") {
                columnConfig.render = (_: unknown, { valueDiscount, type }: { valueDiscount: number, type: string | boolean }) => (
                    <Tag color="blue">{type === "PERCENT" ? valueDiscount + "%" : valueDiscount.toLocaleString() + " VND"}</Tag>
                );
            } else if (field === "status") {
                columnConfig.render = (_: unknown, { status }: { status: string }) => (
                    <Tag color={status === "ACTIVE" ? "green-inverse" : "volcano-inverse"}>{status === "ACTIVE" ? "Hoạt động" : "Dừng hoạt động"}</Tag>
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
                    {hasPermission("PATCH", "/api/v1/admin/discount/:id") &&
                        <FaPen
                            onClick={() => {
                                setOpen(true);
                                setDataClick(record);
                            }}
                            className='hover:text-blue-500 cursor-pointer'
                        />
                    }

                    {hasPermission("DELETE", "/api/v1/admin/discount/:id") &&
                        <ConfirmDeletePopconfirm
                            onConfirm={() => handleDelete(record._id as string)}
                            loading={deleteDiscount.isPending}
                        >
                            <FaTrashAlt className='hover:text-red-500 cursor-pointer' />
                        </ConfirmDeletePopconfirm>
                    }
                </div>
            ),
        },
    ];

    let dataTable: DataType<IDiscount>[] = [];
    if (!loading && discounts.length > 0 && hasPermission("GET", "/api/v1/admin/discount")) {
        dataTable = discounts.map((item: IDiscount, index: number) => {
            const row = {
                key: index.toString(),
                _id: item._id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...fields.reduce((acc: any, field: any) => {
                    if (item.hasOwnProperty(field)) {
                        acc[field] = item[field as keyof IDiscount];
                    }
                    return acc;
                }, {}),
            };
            return row as DataType<IDiscount>;
        });
    }

    return (
        <>
            <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen} footer={null}>
                {hasPermission("PATCH", "/api/v1/admin/discount/:id") &&
                    <UpdateModalDiscount setOpen={setOpen} dataDiscount={dataClick} />
                }
            </Modal>
            <SelectedDiscountContext.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionDiscount ConfigFields={{ fields, setFields }} Filter={<FilterDiscount />} EditSort={<EditSortDiscount />} ContentModal={<ContentModalDiscount />} />
                <Spin size="large" spinning={loading}>
                    <TableContent<DataType<IDiscount>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedDiscountContext.Provider>
        </>
    )
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsDiscount = () => {
    const context = useContext(SelectedDiscountContext);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong DiscountProvider");
    }
    return context;
};
