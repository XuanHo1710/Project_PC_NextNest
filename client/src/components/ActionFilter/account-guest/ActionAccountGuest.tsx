'use client'
import '@ant-design/v5-patch-for-react-19';
import { Modal } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { JSX, useState } from 'react';
import ConfigModalAccountGuest from '@/components/ContentModal/account-guest/ConfigModalAccountGuest';

type ConfigFieldsType = {
    fields: Array<string>;
    setFields: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export default function ActionAccountGuest({ EditSort, Filter, ConfigFields }: { EditSort: JSX.Element, Filter: JSX.Element, ConfigFields: ConfigFieldsType }) {
    const [openConfig, setOpenConfig] = useState<boolean>(false);

    const handleOk = () => {
        setOpenConfig(false);
    };

    const handleCancel = () => {
        setOpenConfig(false);
    };

    return (
        <>
            <Modal title="Setting display" width={1000} open={openConfig} onOk={handleOk} onCancel={handleCancel} footer={null}>
                <ConfigModalAccountGuest ConfigFields={ConfigFields} />
            </Modal>
            {Filter}
            {EditSort}
            <div className="mt-5 border-t-[1px] border-solid border-slate-200 py-2 px-2 flex items-center justify-between">
                <h3 className="mx-2 text-base font-semibold">Danh sách</h3>
                <div className="flex items-center justify-center">
                    <SettingOutlined onClick={() => setOpenConfig(true)} className='mx-1' />
                </div>
            </div>
        </>
    );
}
