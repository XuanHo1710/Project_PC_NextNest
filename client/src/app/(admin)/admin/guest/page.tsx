'use client'
import { Avatar, Spin, Tag } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import { createContext, useContext, useEffect, useState } from "react";
import { IEmployee, useEmployeeStore } from "@/stores/employeeStore";
import { useQueryParams } from "@/hooks/QueryParamsContext";
import TableContent from "@/components/TableContent/TableContent";
import ActionGuest from "@/components/ActionFilter/guest/ActionGuest";
import FilterGuest from "@/components/ActionFilter/guest/FilterGuest";
import EditSortGuest from "@/components/EditSort/guest/EditSortGuest";


export interface DataType extends IEmployee {
    key: string;
}

type SelectedContextType = {
    selectedRows: Array<string>;
    setSelectedRows: React.Dispatch<React.SetStateAction<Array<string>>>;
};

const SelectedContextGuest = createContext<SelectedContextType | undefined>(undefined);


export default function Guest() {
    const { queryParams } = useQueryParams();
    const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
    const [fields, setFields] = useState<Array<string>>([
        "name",
        "age",
        "address",
        "phone",
        "gender",
        "birthday"
    ]);

    // const { employees, fetchEmployees, loading, message } = useEmployeeStore()


    // useEffect(() => {
    //     fetchEmployees("?" + queryParams.toString() as string)
    // }, [fetchEmployees, queryParams, message]);




    const columns: ColumnsType<DataType> = [
        ...fields.map((field) => {
            const columnConfig: ColumnType<DataType> = {
                title: field.charAt(0).toUpperCase() + field.slice(1), // Tạo title từ field
                dataIndex: field,
                key: field,
            };

            // Thêm render tùy chỉnh cho các trường cụ thể
            if (field === "name") {
                columnConfig.render = (_: unknown, { name, avatar }: { name: string, avatar: string }) => (
                    <div className="flex items-center gap-4">
                        <Avatar src={avatar} alt={name} />
                        <h2 className="text-md">{name}</h2>
                    </div>
                );
            } else if (field === "age") {
                columnConfig.render = (_: unknown, { age }: { age: number }) => (
                    <Tag color="cyan">{age}</Tag>
                );
            } else if (field === "gender") {
                columnConfig.render = (_: unknown, { gender }: { gender: string }) => (
                    <Tag color={gender === "Nam" ? "blue" : "pink"}>{gender}</Tag>
                );
            }

            return columnConfig;
        })
    ];

    let dataTable: DataType[] = [];
    // if (!loading && employees.length > 0) {
    //     dataTable = employees.map((item, index) => {
    //         const row = {
    //             key: index.toString(),
    //             avatar: item.avatar,
    //             _id: item._id,
    //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //             ...fields.reduce((acc: any, field: any) => {
    //                 if (item.hasOwnProperty(field)) {
    //                     acc[field] = item[field as keyof IEmployee];
    //                 }
    //                 return acc;
    //             }, {}),
    //         };
    //         return row as DataType;
    //     });
    // }


    return (
        <>
            <SelectedContextGuest.Provider value={{ selectedRows, setSelectedRows }} >
                <div className="py-2">
                    <h2 className="text-center text-2xl font-bold">Trang khách hàng</h2>
                    <ActionGuest ConfigFields={{ fields, setFields }} Filter={<FilterGuest />} EditSort={<EditSortGuest />} />
                    <Spin size="large" spinning={false} >
                        <TableContent<DataType> selectedRows={selectedRows} setSelectedRows={setSelectedRows} columns={columns} data={dataTable}></TableContent>
                    </Spin>
                </div>
            </SelectedContextGuest.Provider>
        </>
    );
}

// Custom hook để dùng trong các component khác
export const useSelectedRowsGuest = () => {
    const context = useContext(SelectedContextGuest);
    if (!context) {
        throw new Error("useQueryParams phải được dùng trong Guest Provider");
    }
    return context;
};
