'use client'
import '@ant-design/v5-patch-for-react-19';

import { Button, Form, Input, Modal, Select } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';


export default function Filterbar({ContentModal} : any) {
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

            <div className="shadow-inner my-5 bg-slate-50 py-2 px-2 rounded-xl">
                <h2 className='py-2 text-lg font-sans px-2 border-slate-200 border-b-2 border-solid'>Bộ lọc và tìm kiếm</h2>
                <div className='flex mt-4 items-center justify-between'>
                    <div className="flex items-center justify-center ">
                        <h3 className="mx-2">Trạng thái: </h3>
                        <Button className="mx-1 !bg-green-400 !text-white !font-bold">Tất cả</Button>
                        <Button className="mx-1 !bg-green-400 !text-white !font-bold">Hoạt động</Button>
                        <Button className="mx-1 !bg-green-400 !text-white !font-bold">Dừng hoạt động</Button>
                    </div>

                    <div className="flex items-center justify-center">
                        <Form>
                            <Form.Item className='!m-0' label="Tìm kiếm">
                                <Input.Search className='!w-full' placeholder="Nhập từ khóa tìm kiếm" />
                            </Form.Item>
                        </Form>



                        <Button type='primary' className='ml-5 w-1/6'>Mở rộng</Button>
                    </div>
                </div>

            </div>
            <div className="mt-5 rounded-xl shadow-inner bg-slate-50 py-5 px-2">
                <h2 className='pb-2 text-lg font-sans px-2 border-slate-200 border-b-2 border-solid'>Chỉnh sửa và sắp xếp theo tiêu chí</h2>
               <div className='flex mt-4 items-center justify-between'>
                <div className="flex items-center justify-center">
                        <h3 className="mx-2">Sắp xếp theo tiêu chí: </h3>
                        <Select
                            defaultValue="lucy"
                            style={{ width: 200 }}
                            options={[
                                { value: 'jack', label: 'Vị trí tăng dần' },
                                { value: 'lucy', label: 'Vị trí giảm dần' },
                                { value: 'Yiminghe', label: 'yiminghe' },
                                { value: 'disabled', label: 'Disabled', disabled: true },
                            ]}
                        />

                    </div>

                <div className="flex items-center justify-center w-2/5">
                    <Form className='flex items-center justify-center'>
                        <Form.Item className='!m-0' label="Thay đổi: ">
                            <Select style={{ width: 300 }} defaultValue={"Chọn tiêu chí thay đổi"}>
                                <Select.Option value="active" >Hoạt động</Select.Option>
                                <Select.Option value="deactive">Dừng hoạt động</Select.Option>
                                <Select.Option value="remove">Xóa</Select.Option>
                            </Select>
                        </Form.Item>
                        <Button type='primary' className='mx-2'>Thay đổi</Button>
                    </Form>
                </div>
               </div>
            </div>
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
