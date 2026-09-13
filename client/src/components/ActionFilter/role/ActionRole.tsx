'use client'
import { useHasPermission } from '@/hooks/admin/useHasPermission';
import { Button, Modal } from "antd";
import { JSX, useState } from 'react';


export default function ActionRole({ ContentModal, EditSort, Filter }: { ContentModal: JSX.Element, EditSort: JSX.Element, Filter: JSX.Element }) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const hasPermission = useHasPermission();


    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Modal width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
                {ContentModal}
            </Modal>
            {Filter}
            {EditSort}
            <div className="mt-5 border-t-[1px] border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2 text-base font-semibold">Danh sách</h3>
                <div className="flex items-center justify-center">
                    {hasPermission("POST", "/api/v1/admin/role") &&
                        <Button onClick={() => setIsModalOpen(true)} className='mx-1' variant='outlined' color='blue'>Thêm mới</Button>
                    }
                </div>
            </div>
        </>
    );
}
