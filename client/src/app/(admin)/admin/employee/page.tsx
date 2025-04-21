'use client'
import { Avatar, Modal, Popconfirm, Spin, TableProps } from "antd";
import Filterbar from "../../../../../components/Filterbar/Filterbar";
import TableContent from "../../../../../components/TableContent/TableContent";
import { FaPen, FaTrashAlt } from "react-icons/fa";
import ContentModalEmployee from "../../../../../components/ContentModal/employee/ContentModalEmployee";
import { RootState, useAppDispatch } from "../../../../../stores/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchDeleteEmployee, fetchEmployees } from "../../../../../features/employees/EmployeeSlice";
import { toast } from "react-toastify";
import UpdateModalEmployee from "../../../../../components/ContentModal/employee/UpdateModalEmployee";

export interface DataType {
    key: string;
    avatar: string;
    name: string;
    email: string;
    age: number;
    address: string;
    gender: string;
    role: string;
    _id?: string
}
  

export default function Employee() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [isOpen, setOpen] = useState(false);
    const [dataClick, setDataClick] = useState<null | DataType>(null);

    const {employees, status, error} = useSelector((state : RootState) => state.employee);
    


    useEffect(() => {
        dispatch(fetchEmployees())
        setLoading(false);
    }, [dispatch])

    const handleDelete = async (id: string) => {
        try {
            await dispatch(fetchDeleteEmployee(id)).unwrap();
            toast.success("Xóa nhân viên này thành công !!");
            dispatch(fetchEmployees())
        } catch (err) {
            toast.error("Xóa nhân viên này thất bại do lỗi: " + error + " " + err);
        }
    }

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Họ tên',
            dataIndex: 'name',
            key: 'name',
            render: (_, {name, avatar}) => {
                return (
                    <div className="flex items-center gap-4">
                        <Avatar src={avatar} alt={name} />
                        <h2 className="text-md">{name}</h2>
                    </div>
                )
            },
        },
        {
            title: 'Tuổi',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Address',
            key: 'address',
            dataIndex: 'address',
        },
        {
            title: 'Vai trò',
            key: 'role',
            dataIndex: 'role',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                    <div key={record._id} className='flex items-center gap-5'>
                        <FaPen onClick={() => {setOpen(true); setDataClick(record);}} className='hover:text-blue-500 cursor-pointer'/>
                        <Popconfirm
                            title="Xóa dòng của bạn"
                            description="Bạn có chắc chắn muốn xóa dòng này ?"
                            onConfirm={() => handleDelete(record._id as string)}
                            // onCancel={cancel}
                            okText="Xóa"
                            cancelText="Không"
                        >
                         <FaTrashAlt className='hover:text-red-500 cursor-pointer'/>
                        </Popconfirm>
                    </div>
                </>
            ),
        },
    ];

    console.log(dataClick);
    

   let dataTable: DataType[] = [];
   if(status === "success" && employees.length > 0){
        dataTable = employees.map((item, index) => (
            {
                key: index.toString(),
                name: item.name,
                age: item.age,
                address: item.address,
                avatar: item.avatar,
                email: item.email,
                role: item.role,
                _id: item._id,
                gender: item.gender
            }
        ))
   }


  return ( 
    <>
        <Modal width={1000} onCancel={() => setOpen(false)} onOk={() => setOpen(false)} open={isOpen}>
            <UpdateModalEmployee setOpen={setOpen} dataEmployee={dataClick} />
        </Modal>
        <div className="py-2">
            <h2 className="text-center text-2xl font-bold">Trang nhân viên</h2>
            <Filterbar ContentModal={<ContentModalEmployee />}></Filterbar>
            <Spin size="large" spinning={loading}>
                <TableContent columns={columns} data={dataTable}></TableContent>
            </Spin>
        </div>
    </>
  );
}
