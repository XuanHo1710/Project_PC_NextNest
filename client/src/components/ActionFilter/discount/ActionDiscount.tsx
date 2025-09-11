'use client'
import ConfigModalDiscount from '@/components/ContentModal/discount/ConfigModalDiscount';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { SettingOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { Button, Modal } from "antd";
import { JSX, useState } from 'react';


type ConfigFieldsType = {
    fields: Array<string>;
    setFields: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function ActionDiscount({ ContentModal, EditSort, Filter, ConfigFields }: { ContentModal: JSX.Element, EditSort: JSX.Element, Filter: JSX.Element, ConfigFields: ConfigFieldsType }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [openConfig, setOpenConfig] = useState<boolean>(false);
    const { accountLogin } = useAuthEmployee();


    const handleOk = () => {
        setIsModalOpen(false);
        setOpenConfig(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setOpenConfig(false);
    };

    return (
        <>
            <Modal width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
                {ContentModal}
            </Modal>
            <Modal title="Setting display" width={1000} open={openConfig} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <ConfigModalDiscount ConfigFields={ConfigFields} />
            </Modal>
            {Filter}
            {EditSort}
            <div className="mt-5 border-t-[1px] border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2 text-base font-semibold">Danh sách</h3>
                <div className="flex items-center justify-center">
                    {accountLogin && accountLogin.role && accountLogin.role.permission.some(
                        (p) => p.method === "POST" && p.path === "/api/v1/admin/discount"
                    ) &&
                        <Button onClick={() => setIsModalOpen(true)} className='mx-1' variant='outlined' color='blue'>Thêm mới</Button>
                    }
                    <SettingOutlined onClick={() => setOpenConfig(true)} className='mx-1' />
                </div>
            </div>
        </>
    );
}
