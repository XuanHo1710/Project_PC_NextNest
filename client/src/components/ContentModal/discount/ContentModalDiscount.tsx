'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Input, InputNumber, Select, Spin, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { DatePicker } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { IDiscount } from '@/types/modal.d';
import { useCreateDiscount } from '@/hooks/admin';



const { RangePicker } = DatePicker;


export default function ContentModalDiscount() {
    const [isMoney, setIsMoney] = useState(false);
    const addDiscount = useCreateDiscount();

    const [form] = Form.useForm();

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleAdd = async (data: IDiscount & { date: dayjs.Dayjs[] }) => {
        const startDate = data.date[0].toISOString();
        const endDate = data.date[1].toISOString();

        const discount = {
            ...data,
            type: data.type ? "MONEY" : "PERCENT",
            startDate: startDate,
            endDate: endDate,
        };

        try {
            await addDiscount.mutateAsync(discount as Omit<IDiscount, '_id'>);
            form.resetFields();
        } catch {
            // Error is handled in the hook
        }
    }




    return (
        <>
            <Spin size='large' spinning={addDiscount.isPending}>
                <h2 className='text-lg font-bold my-4'>Thêm mới khuyến mãi:</h2>
                <Form
                    onFinish={handleAdd}
                    {...layout}
                    initialValues={{
                        name: "",
                        type: false, //TRUE: MONEY, FALSE: PERCENT
                        description: "",
                        valueDiscount: 0,
                        status: "ACTIVE"
                    }}
                    form={form}
                >
                    <Form.Item label="Tên khuyến mãi" name="name" className='font-sans text-lg' rules={[
                        {
                            required: true,
                            message: 'Tên không được để trống',
                            whitespace: true
                        },
                    ]}>
                        <Input placeholder='Nhập tên khuyến mãi ...' />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description" className='font-sans text-lg'>
                        {/* <Editor
                        apiKey='khxusq0asd4iti4y0w3ns1q40ilvc6f75g7ugbtcgivgccff'
                        init={{
                            plugins: [
                                // Core editing features
                                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                                // Your account includes a free trial of TinyMCE premium features
                                // Try the most popular premium features until Apr 17, 2025:
                                'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                            ],
                            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                            tinycomments_mode: 'embedded',
                            tinycomments_author: 'Author name',
                            mergetags_list: [
                                { value: 'First.Name', title: 'First Name' },
                                { value: 'Email', title: 'Email' },
                            ],
                        }}
                        initialValue="Type your description in here"
                    /> */}
                        <TextArea placeholder='Nhập mô tả' />
                    </Form.Item>
                    <Form.Item label="Chọn ngày" name="date" className='font-sans text-lg' rules={[
                        {
                            required: true,
                            message: 'Vui lòng chọn khoảng ngày!'
                        },
                    ]}>
                        <RangePicker minDate={dayjs()} />
                    </Form.Item>
                    <Form.Item label="Loại" name="type" className='font-sans text-lg'>
                        <Switch onChange={() => setIsMoney(!isMoney)} checkedChildren={"Tiền"} unCheckedChildren={"Phần trăm"} />
                    </Form.Item>
                    {isMoney ?
                        <Form.Item label="Giá tiền" name="valueDiscount" className='font-sans text-lg'>
                            <InputNumber<number>
                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/VND\s?|(,*)/g, '') as unknown as number}
                                className='!w-full'
                                min={0}
                                placeholder='Nhập số tiền giảm ...'
                            />
                        </Form.Item>
                        :
                        <Form.Item label="Phần trăm" name="valueDiscount" className='font-sans text-lg'>
                            <InputNumber<number>
                                formatter={(value) => `${value}%`}
                                parser={(value) => value?.replace('%', '') as unknown as number}
                                step={1} className='!w-full' min={0} max={100}
                                placeholder='Mã giảm giá có giá trị từ 0 -> 100'
                            />
                        </Form.Item>
                    }

                    <Form.Item label="Trạng thái" name="status" className='font-sans text-lg'>
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                            <Select.Option value="INACTIVE">Dừng hoạt động</Select.Option>
                        </Select>
                    </Form.Item>
                    <div className='text-right mb-10'>
                        <Button loading={addDiscount.isPending} htmlType='submit' variant='solid' color='primary' className='text-right'>Thêm mới</Button>
                        <Button loading={addDiscount.isPending} htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin >
        </>
    );

}
