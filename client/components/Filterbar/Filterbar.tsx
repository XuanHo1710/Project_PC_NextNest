'use client'
import '@ant-design/v5-patch-for-react-19';

import { Button, Modal } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { JSX, useState } from 'react';


export default function Filterbar({ContentModal, EditSort, Filter} : {ContentModal: JSX.Element, EditSort:JSX.Element, Filter:JSX.Element}) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
    const handleOk = () => {
      setIsModalOpen(false);
    };
  
    const handleCancel = () => {
      setIsModalOpen(false);
    };

    return (
        <>
            <Modal width={1000} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                {ContentModal}
            </Modal>
            {Filter}
            {EditSort}
            <div className="bg-slate-50 mt-5 border-b-2 border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2">Danh sách sản phẩm</h3>
                <div className="flex items-center justify-center">
                    <Button onClick={() => setIsModalOpen(true)} className='mx-1' type='primary'>Thêm mới</Button>
                    <Button className='mx-1 hover:!text-black !bg-green-300'>Import file csv</Button>
                    <Button className='mx-1 hover:!text-black !bg-green-300'>Export file csv</Button>
                    <SettingOutlined className='mx-1' />
                </div>
            </div>
        </>
    );
}
