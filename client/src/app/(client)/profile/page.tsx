'use client';

import { Button, Form, Input } from "antd";
import Link from "next/link";



export default function ProfileClient() {

    // const { inforUser, setRefresh, refresh } = useUser();
    const layout = {
        labelCol: {
            span: 4,
        },
        wrapperCol: {
            span: 20,
        },
    };

    const handleUpdateUser = async (data: unknown) => {
        // Object.keys(data).forEach(key => {
        //     if (data[key] === undefined) {
        //         delete data[key];
        //     }
        // });
        console.log(data);

    }


    //     const statusUpdate = await patch(`users/${inforUser._id}`, data)
    //     if (statusUpdate.code === 200) {
    //         toast.success("Cập nhật thông tin thành công !")
    //         setRefresh(!refresh)
    //     }
    // }

    return (
        <>
            <div className="md:pt-3 pt-52 bg-slate-50 dark:bg-slate-900 dark:text-white">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500  dark:text-white mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg text-blue-400 dark:text-white mr-3">Hồ sơ người dùng</h3>
                </div>
                <div className='mx-5 xl:mx-32 mt-5 pb-5 grid grid-flow-row grid-cols-12 gap-0 lg:gap-9'>
                    <div className='col-span-12 lg:col-span-3'>
                        <div className='flex items-center'>
                            <i className='fas fa-user-circle text-5xl text-blue-600'></i>
                            <div className='mx-4'>
                                <h6 className='text-base font-semibold'>Tài khoản của,</h6>
                                <h1 className='font-bold text-lg'>
                                    {/* {inforUser?.fullname} */}
                                    Nguyễn Xuân Hồ
                                </h1>
                            </div>
                        </div>
                        <ul className='pl-0 my-5'>
                            <Link className='font-medium block my-3 py-3 bg-blue-400 text-white px-5  rounded-lg' href={"/profile/detail"}>
                                <li className='inline-block'>
                                    <i className="fa-regular fa-user w-9"></i>
                                    <span className='font-medium'>Thông tin tài khoản</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/order"}>
                                <li className='inline-block'>
                                    <i className="far fa-list-alt w-9"></i>
                                    <span className='font-medium'>Tra cứu đơn hàng</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/address"}>
                                <li className='inline-block'>
                                    <i className="fa-solid fa-location-dot w-9"></i>
                                    <span className='font-medium'>Thêm địa chỉ mới</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/profile/password"}>
                                <li className='inline-block'>
                                    <i className="fas fa-lock w-9"></i>
                                    <span className='font-medium'>Thay đổi mật khẩu</span>
                                </li>
                            </Link>
                            <Link className='font-medium block my-3 py-3 hover:bg-blue-400 hover:text-white px-5 bg-stone-200 rounded-lg text-stone-600' href={"/home"}>
                                <li className='inline-block'>
                                    <i className="fas fa-sign-out-alt w-9"></i>
                                    <span className='font-medium'>Đăng xuất</span>
                                </li>
                            </Link>

                        </ul>
                    </div>
                    <div className='col-span-12 lg:col-span-9 p-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:text-white'>
                        <h2 className='text-xl font-bold pb-3 border-solid border-b-2 border-blue-200 dark:border-slate-900 dark:text-white'>Cập nhật thông tin cá nhân</h2>
                        {/* {inforUser._id && */}
                        <Form onFinish={handleUpdateUser}  {...layout} labelAlign='left' className='my-5'>
                            <Form.Item className='font-bold text-3xl' name="fullname" label={<span className="dark:text-white">Họ và tên</span>}>
                                <Input
                                    className='font-normal py-2 text-base dark:bg-gray-400'
                                    placeholder='Nhập họ và tên'
                                // defaultValue={inforUser?.fullname}
                                />
                            </Form.Item>
                            <Form.Item className='font-bold text-3xl' name="email" label={<span className="dark:text-white">Địa chỉ email</span>}>
                                <Input
                                    className='font-normal py-2 text-base dark:bg-gray-400'
                                    placeholder='Nhập địa chỉ email'
                                // defaultValue={inforUser?.email}
                                />
                            </Form.Item>
                            <Form.Item className='font-bold text-3xl' name="phone" label={<span className="dark:text-white">Số điện thoại</span>}>
                                <Input
                                    className='font-normal py-2 text-base dark:bg-gray-400'
                                    placeholder='Nhập số điện thoại'
                                // defaultValue={inforUser?.phone}
                                />
                            </Form.Item>
                            <Form.Item labelCol={{ span: 4 }} wrapperCol={{ offset: 4 }} className='text-transparent overflow-hidden'>
                                <Button className='bg-red-500 dark:bg-red-600 w-4/5 lg:w-auto button text-white font-bold p-5' type='default' htmlType='submit'>Thay đổi</Button>
                            </Form.Item>
                        </Form>
                        {/* } */}
                    </div>

                </div>

            </div>
        </>
    );
}
