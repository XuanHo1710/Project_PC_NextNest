'use client'
import '@ant-design/v5-patch-for-react-19';
import { Button, Modal, Upload } from "antd";
import { SettingOutlined, UploadOutlined } from '@ant-design/icons';
import { JSX, useState } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useEmployeeStore } from '@/stores/employeeStore';
import ConfigModalEmployee from '@/components/ContentModal/employee/ConfigModalEmployee';
import TableImportEmployeeCSV from '@/components/ContentModal/employee/CSVModalEmployee';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { DataType } from '@/types/table.d';
import { IEmployee } from '@/types/modal.d';

type ConfigFieldsType = {
    fields: Array<string>;
    setFields: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function ActionEmployee({ ContentModal, EditSort, Filter, ConfigFields }: { ContentModal: JSX.Element, EditSort: JSX.Element, Filter: JSX.Element, ConfigFields: ConfigFieldsType }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [openImportCSV, setOpenImportCSV] = useState<boolean>(false);
    const [openConfig, setOpenConfig] = useState<boolean>(false);
    const [fileData, setFileData] = useState<DataType<IEmployee>[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { addEmployee, employees } = useEmployeeStore();
    const { accountLogin } = useAuthEmployee();



    const beforeUpload = (file: File) => {
        setLoading(true);
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const arrayBuffer = e.target?.result;
            const data = new Uint8Array(arrayBuffer as ArrayBuffer);

            // Đọc file Excel từ ArrayBuffer
            const workbook = XLSX.read(data, { type: 'array' });
            // Lấy sheet đầu tiên
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Chuyển sheet thành JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true });
            // In dữ liệu ra console để kiểm tra

            // Lấy hàng đầu tiên (tiêu đề cột)
            const headers = Object.keys(jsonData[0] || {});

            // Kiểm tra xem các trường name, address, email có tồn tại trong tiêu đề không
            const requiredFields = ['name', 'address', 'email', 'avatar', 'age', 'gender', 'role'];
            const missingFields = requiredFields.filter(field => !headers.map(h => h.toLowerCase()).includes(field.toLowerCase()));

            if (missingFields.length > 0) {
                toast.error(`Không thể import file CSV vì thiếu các trường bắt buộc`);
                return false; // Ngăn upload và xóa file khỏi quá trình xử lý
            }
            setFileData(jsonData as DataType<IEmployee>[]);
            setLoading(false);
            toast.success("Đã đọc file CSV thành công!");
            return jsonData;
        };

        // Đọc file dưới dạng ArrayBuffer
        reader.readAsArrayBuffer(file);

        return false; // ngăn upload để xử lý thủ công
    };

    // Hàm xuất file Excel
    const exportToExcel = () => {
        // Tạo một workbook và worksheet
        const wb = XLSX.utils.book_new();
        const dataRefactor = employees.map((em) => {
            return {
                name: em.name,
                address: em.address,
                email: em.email,
                avatar: em.avatar,
                age: em.age
            }
        });
        const ws = XLSX.utils.json_to_sheet(dataRefactor);
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        // Xuất file Excel
        XLSX.writeFile(wb, "report_employee" + "_" + new Date().getDay() + "/" + new Date().getMonth() + "/" + new Date().getFullYear() + '.xlsx');
    };

    const handleImport = () => {
        if (fileData.length === 0) {
            toast.error("Không có dữ liệu để import!");
            return;
        }


        fileData.forEach(async (item) => {
            // Thêm nhân viên vào cơ sở dữ liệu
            await addEmployee(item);
        })


        // Đóng modal sau khi import
        setOpenImportCSV(false);
        toast.success("Import dữ liệu thành công!");
    }

    const handleOk = () => {
        setIsModalOpen(false);
        setOpenImportCSV(false);
        setOpenConfig(false);
        setFileData([]);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setOpenImportCSV(false);
        setOpenConfig(false);
        setFileData([]);
    };

    return (
        <>
            <Modal title="Import CSV" width={1000} open={openImportCSV} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <div className="p-4">
                    <p>Chọn file CSV để import dữ liệu.</p>
                    <Upload accept=".csv,.xlsx,.xls" multiple={false} beforeUpload={beforeUpload} >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                    <TableImportEmployeeCSV loading={loading} employees={fileData} />
                    <div className='text-right my-3'>
                        <Button onClick={handleImport} type='primary'>Import</Button>
                    </div>
                </div>
            </Modal>
            <Modal width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
                {ContentModal}
            </Modal>
            <Modal title="Setting display" width={1000} open={openConfig} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <ConfigModalEmployee ConfigFields={ConfigFields} />
            </Modal>
            {Filter}
            {EditSort}
            <div className="mt-5 border-t-[1px] border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2 text-base font-semibold">Danh sách</h3>
                <div className="flex items-center justify-center">
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "POST" && p.path === "/api/v1/admin/employee"
                    ) &&
                        <Button onClick={() => setIsModalOpen(true)} className='mx-1' variant='outlined' color='blue'>Thêm mới</Button>
                    }
                    <Button onClick={() => setOpenImportCSV(true)} className='mx-1' variant='outlined' color='green'>Import file csv</Button>
                    <Button className='mx-1' variant='outlined' color='green' onClick={exportToExcel}>Export file csv</Button>
                    <SettingOutlined onClick={() => setOpenConfig(true)} className='mx-1' />
                </div>
            </div>
        </>
    );
}
