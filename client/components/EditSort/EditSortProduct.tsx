'use client'

import { Button, Form, Select } from "antd";

const EditSortProduct = () => {
    return (
        <>
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
        
        </>
    )
}

export default EditSortProduct;