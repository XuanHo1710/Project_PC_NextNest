'use client'
import { Avatar, Popconfirm, Spin, Tag } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useState } from "react";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import ActionAccountGuest from "@/components/ActionFilter/account-guest/ActionAccountGuest";
import FilterAccountGuest from "@/components/ActionFilter/account-guest/FilterAccountGuest";
import EditSortAccountGuest from "@/components/EditSort/account-guest/EditSortAccountGuest";
import { DataType, SelectedContextType } from "@/types/table.d";
import { IAccountGuest } from "@/types/account-guest";
import { useAccountGuests, useDeleteAccountGuest } from "@/hooks/admin";
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { FaTrashAlt } from "react-icons/fa";


const SelectedContextAccountGuest = createContext<SelectedContextType | undefined>(undefined);

export default function ContentAccountGuest() {
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    // Fields theo đúng entity AccountGuest
    const [fields, setFields] = useState<Array<string>>([
        "avatar",
        "fullname",
        "email",
        "phone",
        "accountStatus",
        "authProvider"
    ]);

    const { accountLogin } = useAuthEmployee();

    // Use TanStack Query hooks
    const {
        data: accountGuests = [],
        isLoading: loading
    } = useAccountGuests(queryParams.toString());

    const deleteAccountGuest = useDeleteAccountGuest();

    const handleDelete = async (id: string) => {
        try {
            await deleteAccountGuest.mutateAsync(id);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    }

    console.log(accountGuests)


    const columns: ColumnsType<DataType<IAccountGuest>> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType<IAccountGuest>> = {
                title: getFieldTitle(field),
                dataIndex: field,
                key: field,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "avatar") {
                columnConfig.render = (_: unknown, record: DataType<IAccountGuest>) => (
                    <Avatar src={record.avatar} alt={record.fullname || 'Avatar'} />
                );
            } else if (field === "accountStatus") {
                columnConfig.render = (_: unknown, { accountStatus }: { accountStatus: string }) => {
                    const statusColors: Record<string, string> = {
                        ACTIVE: "green",
                        PENDING: "orange",
                        SUSPENDED: "red",
                        DELETED: "gray"
                    };
                    const statusLabels: Record<string, string> = {
                        ACTIVE: "Hoạt động",
                        PENDING: "Chờ xác nhận",
                        SUSPENDED: "Đã khóa",
                        DELETED: "Đã xóa"
                    };
                    return (
                        <Tag color={statusColors[accountStatus] || "default"}>
                            {statusLabels[accountStatus] || accountStatus}
                        </Tag>
                    );
                };
            } else if (field === "authProvider") {
                columnConfig.render = (_: unknown, { authProvider }: { authProvider: string }) => (
                    <Tag color={authProvider === "google" ? "blue" : "default"}>
                        {authProvider === "google" ? "Google" : "Email"}
                    </Tag>
                );
            } else if (field === "gender") {
                columnConfig.render = (_: unknown, { gender }: { gender: string }) => (
                    <Tag color={gender === "MALE" ? "blue" : gender === "FEMALE" ? "pink" : "default"}>
                        {gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác"}
                    </Tag>
                );
            }

            return columnConfig;
        }),
        // Cột action
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div key={record._id} className='flex items-center gap-5'>
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "DELETE" && p.path === "/api/v1/admin/account-guest/:id"
                    ) &&
                        <Popconfirm
                            title="Xóa tài khoản khách hàng"
                            description="Bạn có chắc chắn muốn xóa tài khoản này?"
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

    let dataTable: DataType<IAccountGuest>[] = [];
    if (!loading && accountGuests.length > 0) {
        dataTable = accountGuests.map((item: IAccountGuest, index: number) => {
            const row = {
                key: index.toString(),
                _id: item._id,
                avatar: item.avatar,
                fullname: item.fullname,
                email: item.email,
                phone: item.phone,
                accountStatus: item.accountStatus,
                authProvider: item.authProvider,
                gender: item.gender,
                totalOrders: item.totalOrders,
                totalSpent: item.totalSpent,
                loyaltyPoints: item.loyaltyPoints,
            };
            return row as DataType<IAccountGuest>;
        });
    }

    return (
        <>
            <SelectedContextAccountGuest.Provider value={{ selectedRows, setSelectedRows }} >
                <ActionAccountGuest ConfigFields={{ fields, setFields }} Filter={<FilterAccountGuest />} EditSort={<EditSortAccountGuest />} />
                <Spin size="large" spinning={loading} >
                    <TableContent<DataType<IAccountGuest>> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                </Spin>
            </SelectedContextAccountGuest.Provider>
        </>
    )
}

// Helper function để đổi tên field thành tiếng Việt
function getFieldTitle(field: string): string {
    const titles: Record<string, string> = {
        avatar: "Ảnh",
        fullname: "Họ tên",
        email: "Email",
        phone: "SĐT",
        accountStatus: "Trạng thái",
        authProvider: "Đăng nhập qua",
        gender: "Giới tính",
        totalOrders: "Tổng đơn",
        totalSpent: "Tổng chi tiêu",
        loyaltyPoints: "Điểm tích lũy"
    };
    return titles[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsAccountGuest = () => {
    const context = useContext(SelectedContextAccountGuest);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong AccountGuest Provider");
    }
    return context;
};
