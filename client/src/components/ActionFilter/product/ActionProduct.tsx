'use client'
import '@ant-design/v5-patch-for-react-19';
import { Button, Modal, Upload } from "antd";
import { SettingOutlined, UploadOutlined } from '@ant-design/icons';
import { JSX, useState } from 'react';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import TableImportProductCSV from '@/components/ContentModal/product/CSVModalProduct';
import ConfigModalProduct from '@/components/ContentModal/product/ConfigModalProduct';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { DataType } from '@/types/table.d';
import { IProduct } from '@/types/product';
import { useCreateProduct, useProducts } from '@/hooks/admin';

type ConfigFieldsType = {
    fields: Array<string>;
    setFields: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function ActionProduct({ ContentModal, EditSort, Filter, ConfigFields }: { ContentModal: JSX.Element, EditSort: JSX.Element, Filter: JSX.Element, ConfigFields: ConfigFieldsType }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [openImportCSV, setOpenImportCSV] = useState<boolean>(false);
    const [openConfig, setOpenConfig] = useState<boolean>(false);
    const [fileData, setFileData] = useState<DataType<IProduct>[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const addProduct = useCreateProduct();
    const { data: products = [] } = useProducts();
    const { accountLogin } = useAuthEmployee();



    const beforeUpload = async (file: File) => {
        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e: ProgressEvent<FileReader>) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;

                // Đọc file Excel từ ArrayBuffer với ExcelJS
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(arrayBuffer);

                // Lấy sheet đầu tiên
                const worksheet = workbook.worksheets[0];

                if (!worksheet) {
                    toast.error("File Excel không có sheet nào!");
                    setLoading(false);
                    return false;
                }

                // Chuyển sheet thành JSON
                const jsonData: Record<string, unknown>[] = [];
                const headers: string[] = [];

                // Lấy header từ dòng đầu tiên
                const headerRow = worksheet.getRow(1);
                headerRow.eachCell((cell, colNumber) => {
                    headers.push(cell.value?.toString().toLowerCase() || `column${colNumber}`);
                });

                // Lấy data từ các dòng còn lại
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return; // Skip header row

                    const rowData: Record<string, unknown> = {};
                    row.eachCell((cell, colNumber) => {
                        const header = headers[colNumber - 1];
                        rowData[header] = cell.value;
                    });

                    // Chỉ thêm row nếu có data
                    if (Object.keys(rowData).length > 0) {
                        jsonData.push(rowData);
                    }
                });

                // Kiểm tra xem các trường bắt buộc có tồn tại trong tiêu đề không
                const requiredFields = ['name', 'images', 'description', 'stock', 'discount', 'oldPrice', 'other', 'status', 'feature', 'position'];
                const missingFields = requiredFields.filter(field =>
                    !headers.includes(field.toLowerCase())
                );

                if (missingFields.length > 0) {
                    toast.error(`Không thể import file vì thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
                    setLoading(false);
                    return false;
                }

                setFileData(jsonData as unknown as DataType<IProduct>[]);
                setLoading(false);
                toast.success("Đã đọc file Excel thành công!");
                return jsonData;
            } catch (error) {
                console.error('Error reading Excel file:', error);
                toast.error("Lỗi khi đọc file Excel!");
                setLoading(false);
                return false;
            }
        };

        // Đọc file dưới dạng ArrayBuffer
        reader.readAsArrayBuffer(file);

        return false; // ngăn upload để xử lý thủ công
    };

    // Hàm xuất file Excel
    const exportToExcel = async () => {
        try {
            // Tạo workbook và worksheet với ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Chuẩn bị data
            const dataRefactor = products.map((product) => {
                return {
                    name: product.name,
                    description: product.description,
                    status: product.status,
                }
            });

            // Thêm columns (headers)
            worksheet.columns = [
                { header: 'Name', key: 'name', width: 30 },
                { header: 'Description', key: 'description', width: 40 },
                { header: 'Stock', key: 'stock', width: 10 },
                { header: 'Discount', key: 'discount', width: 10 },
                { header: 'Old Price', key: 'oldPrice', width: 15 },
                { header: 'Other', key: 'other', width: 30 },
                { header: 'Status', key: 'status', width: 10 },
                { header: 'Feature', key: 'feature', width: 10 },
                { header: 'Position', key: 'position', width: 10 },
                { header: 'Images', key: 'images', width: 40 }
            ];

            // Thêm rows
            worksheet.addRows(dataRefactor);

            // Style header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Tạo file name
            const date = new Date();
            const fileName = `report_product_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}.xlsx`;

            // Export file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(url);

            toast.success("Export file Excel thành công!");
        } catch (error) {
            console.error('Error exporting Excel file:', error);
            toast.error("Lỗi khi export file Excel!");
        }
    };

    const handleImport = () => {
        if (fileData.length === 0) {
            toast.error("Không có dữ liệu để import!");
            return;
        }


        fileData.forEach(async (item) => {
            // Thêm sản phẩm vào cơ sở dữ liệu
            await addProduct.mutateAsync(item as Omit<IProduct, '_id'>);
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
                    <TableImportProductCSV loading={loading} products={fileData} />
                    <div className='text-right my-3'>
                        <Button onClick={handleImport} type='primary'>Import</Button>
                    </div>
                </div>
            </Modal>
            <Modal width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
                {ContentModal}
            </Modal>
            <Modal title="Setting display" width={1000} open={openConfig} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <ConfigModalProduct ConfigFields={ConfigFields} />
            </Modal>
            {Filter}
            {EditSort}
            <div className="mt-5 border-t-[1px] border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2 text-base font-semibold">Danh sách</h3>
                <div className="flex items-center justify-center">
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "POST" && p.path === "/api/v1/admin/product"
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
