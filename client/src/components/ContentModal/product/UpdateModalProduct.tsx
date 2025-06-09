'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Image, Input, InputNumber, Select, Spin, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { IProduct, useProductStore } from '@/stores/productStore';




export default function UpdateModalProduct({ dataProduct, setOpen }: { dataProduct: IProduct | null, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [filesUpload, setFilesUpload] = useState<Array<string>>([]);
    const [form] = Form.useForm();
    const { updateProduct, loading } = useProductStore();


    useEffect(() => {
        if (dataProduct !== null) {
            form.setFieldsValue({
                name: dataProduct.name,
                description: dataProduct.description,
                stock: dataProduct.stock,
                discount: dataProduct.discount,
                oldPrice: dataProduct.oldPrice,
                other: [],
                status: dataProduct.status,
                feature: dataProduct.feature,
                position: dataProduct.position
            });
        }
    }, [dataProduct, form]);

    useEffect(() => {
        if (dataProduct && dataProduct.images.length > 0) {
            setFilesUpload(dataProduct.images);
        }
    }, [dataProduct]);

    const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target?.files;
        if (files !== null && files.length > 0) {
            let newFiles = Array.from(files).map(file => URL.createObjectURL(file));
            if (filesUpload.length + newFiles.length >= 8) {
                const spaceLeft = 8 - filesUpload.length;
                newFiles = newFiles.slice(0, spaceLeft);
            }
            setFilesUpload([...filesUpload, ...newFiles]);
        }
    }

    const deleteFileUpload = (file: string) => {
        let filesUploadClone = filesUpload;
        filesUploadClone = filesUploadClone.filter(fileUpload => fileUpload !== file);
        setFilesUpload([...filesUploadClone]);
    }


    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleUpdate = async (data: IProduct) => {
        // let avatarUrl: string = dataEmployee?.avatar || ""; // giữ ảnh cũ mặc định

        // Nếu có file mới => upload và thay avatarUrl
        // if (filesUpload?.file) {
        //     avatarUrl = await UploadImage((filesUpload?.file) as File)
        // }
        const product = {
            ...data,
            _id: dataProduct?._id
        }

        try {
            const status = await updateProduct(product);
            if (status !== 500) {
                toast.success("Sửa sản phẩm thành công !!");
                form.resetFields(); // reset form
                setOpen(false);
            }
        } catch (err) {
            toast.error("Sửa sản phẩm thất bại do lỗi: " + err)
        }
    }



    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Cập nhật sản phẩm:</h2>
                {dataProduct !== null &&
                    <Form
                        onFinish={handleUpdate}
                        {...layout}
                        form={form}
                    >
                        <Form.Item label="Tên sản phẩm" name="name" className='font-sans text-lg'>
                            <Input placeholder='Nhập tên sản phẩm ...' />
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
                        <Form.Item label="Upload ảnh(tối đa 8)" className='font-sans text-lg'>
                            <Input onChange={handlePreviewUpload} placeholder='Chọn ảnh cần upload ...' multiple type='file' accept='image/*' />
                            <div className='preview_upload grid grid-cols-12 grid-flow-row gap-2'>
                                {filesUpload.length > 0 &&
                                    filesUpload.map((file, index) => (
                                        <div key={index} className='col-span-3 relative mt-2 p-2 border border-slate-300'>
                                            <Image className='aspect-video' src={file} alt='' />
                                            <div onClick={() => deleteFileUpload(file)} className='cursor-pointer absolute -top-2 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-white bg-red-500'>X</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </Form.Item>
                        <Form.Item label="Số lượng" name="stock" className='font-sans text-lg'>
                            <InputNumber className='!w-full' min={0} placeholder='Nhập số lượng sản phẩm ...' />
                        </Form.Item>
                        <Form.Item label="Giảm giá" name="discount" className='font-sans text-lg'>
                            <InputNumber<number>
                                formatter={(value) => `${value}%`}
                                parser={(value) => value?.replace('%', '') as unknown as number}
                                step={1} className='!w-full' min={0} max={100}
                                placeholder='Mã giảm giá có giá trị từ 0 -> 100'
                            />
                        </Form.Item>
                        <Form.Item label="Đơn giá" name="oldPrice" className='font-sans text-lg'>
                            <InputNumber<number>
                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/VND\s?|(,*)/g, '') as unknown as number}
                                className='!w-full'
                                min={0}
                                placeholder='Nhập đơn giá sản phẩm ...'
                            />
                        </Form.Item>
                        <Form.Item label="Khác" name="other" className='font-sans text-lg'>
                            <Input className='!w-full' placeholder='Nhập các thuộc tính khác (nếu có)' />
                        </Form.Item>
                        <Form.Item label="Vị trí" name="position" className='font-sans text-lg'>
                            <InputNumber className='!w-full' min={0} placeholder='Nhập vị trí của sản phẩm (Tự động tăng)' />
                        </Form.Item>
                        <Form.Item label="Trạng thái" name="status" className='font-sans text-lg'>
                            <Select placeholder="Chọn trạng thái">
                                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                                <Select.Option value="INACTIVE">Dừng hoạt động</Select.Option>
                                <Select.Option value="STOPSOLD">Ngừng bán</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Nổi bật" name="feature" className='font-sans text-lg'>
                            <Switch checkedChildren={"Có"} unCheckedChildren={"Không"} />
                        </Form.Item>
                        <div className='text-right mb-10'>
                            <Button htmlType='submit' variant='solid' color='primary' className='text-right'>Cập nhật</Button>
                            <Button htmlType='reset' variant='outlined' color='primary' className='text-right mx-2'>Làm mới</Button>
                        </div>
                    </Form>
                }

            </Spin>
        </>
    );
}
