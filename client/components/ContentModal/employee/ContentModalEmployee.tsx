'use client'
import '@ant-design/v5-patch-for-react-19';
// import { Editor } from '@tinymce/tinymce-react';
import { Button, Form, Image, Input, InputNumber, Select, Spin, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useState } from 'react';
import { fetchAddEmployee, fetchEmployees } from '../../../features/employees/EmployeeSlice';
import { useAppDispatch } from '../../../stores/store';
import { UploadImage } from '../../../utils/uploadImage';
import { toast } from 'react-toastify';
import { useQueryParams } from '../../../hooks/QueryParamsContext';


interface IEmployee {
    avatar: string;
    name: string;
    email: string;
    gender: string;
    age: number;
    address: string;
    role: string
}

interface UploadState {
    file: File | null;
    image: string;
}


export default function ContentModalEmployee() {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const [filesUpload, setFilesUpload] = useState<UploadState | null>(null);
    const { queryParams } = useQueryParams();



    const [form] = Form.useForm();

    const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

        const files = e.target?.files;

        console.log(files);


        if (files !== null && files.length > 0) {
            const newFiles = URL.createObjectURL(files[0]);
            setFilesUpload({ file: files[0], image: newFiles });

        }

    }

    const deleteFileUpload = () => {
        setFilesUpload({ file: null, image: "" });
    }

    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 25,
        },
    };

    const handleAdd = async (data: IEmployee) => {
        setLoading(true);
        try {
            const avatarUrl: string = await UploadImage((filesUpload?.file) as File);

            const employee = {
                ...data,
                gender: data.gender ? "Nam" : "Nữ",
                avatar: avatarUrl
            };

            await dispatch(fetchAddEmployee(employee)).unwrap();

            toast.success("Thêm nhân viên thành công!!");
            form.resetFields();
        } finally {
            setLoading(false);
            dispatch(fetchEmployees("?" + queryParams.toString())); // luôn reload danh sách dù thành công hay lỗi
        }
    }


    return (
        <>
            <Spin size='large' spinning={loading}>
                <h2 className='text-lg font-bold my-4'>Thêm mới nhân viên:</h2>
                <Form
                    onFinish={handleAdd}
                    className='border-b-2 border-solid border-slate-200'
                    {...layout}
                    initialValues={{
                        name: "",
                        email: "",
                        age: 17,
                        address: "",
                        role: "Employee",
                        gender: true, // Switch true = MALE, false = FEMALE
                    }}
                    form={form}
                >
                    <Form.Item label="Tên nhân viên" name="name" className='font-sans text-lg'>
                        <Input placeholder='Nhập tên nhân viên ...' />
                    </Form.Item>
                    <Form.Item label="Email" name="email" className='font-sans text-lg'>
                        <Input placeholder='Nhập email nhân viên ...' />
                    </Form.Item>
                    <Form.Item label="Upload ảnh" className='font-sans text-lg'>
                        <Input onChange={handlePreviewUpload} placeholder='Chọn ảnh cần upload ...' type='file' accept='image/*' />
                        <div className='preview_upload grid grid-cols-12 grid-flow-row gap-2'>
                            {filesUpload?.image && filesUpload?.image !== "" &&
                                <div className='col-span-3 relative mt-2 p-2 border border-slate-300'>
                                    <Image className='aspect-video upload_image' src={filesUpload?.image} alt='' />
                                    <div onClick={deleteFileUpload} className='cursor-pointer absolute -top-2 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-white bg-red-500'>X</div>
                                </div>
                            }
                        </div>
                    </Form.Item>
                    <Form.Item label="Tuổi nhân viên" name="age" className='font-sans text-lg'>
                        <InputNumber min={17} max={80} className='!w-1/3' placeholder='Nhập tuổi của nhân viên ...' />
                    </Form.Item>
                    <Form.Item label="Địa chỉ" name="address" className='font-sans text-lg'>
                        <TextArea className='!w-full' placeholder='Nhập địa chỉ của nhân viên' />
                    </Form.Item>
                    <Form.Item label="Vai trò" name="role" className='font-sans text-lg'>
                        <Select placeholder="Chọn vai trò cho nhân viên">
                            <Select.Option value="Employee">Nhân viên</Select.Option>
                            <Select.Option value="Employee_A">Nhân viên kỹ thuật</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Giới tính" name="gender" className='font-sans text-lg'>
                        <Switch checkedChildren={"MALE"} unCheckedChildren={"FEMALE"} />
                    </Form.Item>
                    <div className='text-right mb-10'>
                        <Button htmlType='submit' variant='solid' color='green' className='text-right'>Thêm mới</Button>
                        <Button htmlType='reset' variant='solid' color='purple' className='text-right mx-2'>Làm mới</Button>
                    </div>
                </Form>
            </Spin>
        </>
    );
}
