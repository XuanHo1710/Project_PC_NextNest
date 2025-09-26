'use client';
import CartProduct from "@/components/client/Cart/CartProduct";
import useCartStore from "@/hooks/useCart";
import { Button, Form, Input, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import Link from "next/link";
import { toast } from "react-toastify";



export default function CartClient() {
    const { cart, calculateTotal, updateQuantity, removeFromCart } = useCartStore();

    const handlePlaceOrder = async () => {
        // if (e.address === undefined && e.address_default === undefined) {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // }
        // else if (e.address === "" && e.address_default === "") {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // } else if (e.address_default === "default" && e.address === "") {
        //     toast.error("Địa chỉ giao hàng không được để trống")
        //     return;
        // } else if (e.fullname === undefined || e.fullname.trim() === "") {
        //     toast.error("Họ tên không được để trống")
        //     return;
        // } else if (e.email === undefined || e.email.trim() === "") {
        //     toast.error("Email không được để trống")
        //     return;
        // } else if (e.phone === undefined || e.phone.trim() === "") {
        //     toast.error("Điện thoại không được để trống")
        //     return;
        // }

        // if (cart && cart?.cartItems?.length <= 0) {
        //     toast.error("Bạn chưa mua sản phẩm nào !!")
        //     return;
        // }

        // const userInfo = {
        //     user_id: inforUser._id || "userVangLai",
        //     fullName: e.fullname,
        //     phone: e.phone,
        //     address: (e.address === "" || e.address === undefined) ? e.address_default : e.address,
        //     note: (e.note === "" || e.note === undefined) ? "" : e.note,
        //     email: e.email,
        // }

        // const products = carts.map(cart => (
        //     {
        //         product_id: cart._id,
        //         name: cart.title,
        //         unitPrice: cart.unitPrice,
        //         quanlity: cart.quanlity
        //     }
        // ));

        // let totalPrice = getTotalUnitPrice();

        // const data = {
        //     userInfo, products, totalPrice: totalPrice
        // }



        toast.success("Đặt hàng thành công !!")

        // const statusOrder = await post("order/checkout", data);
        // if (statusOrder.code === 200) {
        //     localStorage.setItem("cart", JSON.stringify([]));
        //     // navigation(`/order/success/${statusOrder.order_id}`)
        //     // setCarts([]);
        // }

    }


    return (
        <>
            <div className="md:pt-3 pt-52 dark:bg-slate-900">
                <div className='mx-5 xl:mx-32 content-header flex items-center flex-wrap'>
                    <Link href="/home" className="font-medium text-lg text-stone-500 mr-3 header-nav active">Trang chủ</Link>
                    <i className="fa-solid fa-chevron-right text-stone-500 mr-3"></i>
                    <h3 className="font-medium text-lg dark:text-white text-stone-500 mr-3">Thông tin giỏ hàng</h3>
                </div>
                <h1 className='mx-5 xl:mx-32 py-2 border-b-blue-400 border-solid border-b-2 md:w-2/3 xl:w-1/3 font-bold text-xl lg:text-3xl uppercase text-blue-500'>Giỏ hàng của tôi
                    <span className='ml-2 text-sm border-none text-stone-400 lowercase font-medium'>({cart?.cartItems.length} sản phẩm)</span>
                </h1>
                <div className='mx-5 xl:mx-32 mt-5 pb-10 content-body grid grid-flow-row grid-cols-12 gap-8 '>
                    <div className='col-span-12 lg:col-span-7 max-h-max bg-white shadow-lg rounded-lg'>
                        <div className='cart-list-product overflow-y-scroll' style={{ maxHeight: "550px", scrollbarWidth: "none" }}>
                            {cart && cart.cartItems.length > 0 ?
                                cart.cartItems.map((cartItem, index) => (
                                    <CartProduct key={index} cartItem={cartItem} handle={{ removeFromCart, updateQuantity }} />
                                ))
                                :
                                <div className='text-center flex flex-col py-10 cursor-default font-bold text-2xl text-blue-400 dark:bg-slate-900 border-solid border-t-[1px] border-x-[1px] border-blue-500'>
                                    <span> Không có sản phẩm nào trong giỏ hàng</span>
                                    <i className="py-10 text-blue-200 block fa-solid fa-cart-shopping text-8xl"></i>
                                </div>
                            }

                        </div>
                        <div className='subtotal border-solid border-[1px] border-blue-500 p-4 flex items-center justify-between dark:bg-slate-900 dark:text-white'>
                            <h2 className='dark:text-white font-bold text-stone-500'>Tổng giá trị đơn hàng: </h2>
                            <p className='font-bold text-blue-500 text-lg md:text-2xl'>{calculateTotal().toLocaleString()} đ</p>
                        </div>
                    </div>
                    <div className='col-span-12 lg:col-span-5 py-3 px-5 border-solid border-2 rounded-lg shadow-xl border-blue-500'>
                        <h2 className='font-bold text-xl text-blue-500'>Thông tin thanh toán</h2>
                        <p className='my-5 font-medium text-base text-stone-500'>
                            Để tiếp tục đặt hàng, quý khách xin vui lòng
                            <Link href={"#"} className='text-blue-500 font-bold'> đăng nhập </Link>
                            để nhập thông tin bên dưới
                        </p>
                        <Form onFinish={handlePlaceOrder}
                            initialValues={{
                                // fullname: inforUser?.fullname,
                                // phone: inforUser?.phone,
                                // email: inforUser?.email,
                                fullname: "",
                                phone: "",
                                email: "",
                            }}
                        >
                            <Form.Item name='fullname'>
                                <Input
                                    // defaultValue={inforUser?.fullname}
                                    name='fullname'
                                    className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                    placeholder='Nhập họ và tên'
                                />
                            </Form.Item>
                            <Form.Item name='phone'>
                                <Input
                                    // defaultValue={inforUser?.phone} 
                                    name='phone'
                                    className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                    placeholder='Nhập số điện thoại'
                                />
                            </Form.Item>
                            <Form.Item name='email'>
                                <Input
                                    //  defaultValue={inforUser?.email} 
                                    name='email'
                                    className='text-base dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500 py-2 font-medium'
                                    placeholder='Nhập email'
                                />
                            </Form.Item>
                            <Form.Item name="address">
                                <Select className='mb-5 w-full h-10 font-bold text-lg' defaultValue={'default'} placeholder="Chọn địa chỉ có sẵn" >
                                    <Select.Option value='default'>Chọn địa chỉ</Select.Option>
                                    {/* {inforUser?.address?.length > 0 &&
                                        inforUser?.address.map((item, index) => (
                                            <Select.Option key={index} value={item}>{item}</Select.Option>
                                        ))
                                    } */}
                                </Select>
                            </Form.Item>
                            <Form.Item name='address'>
                                <Input name='address' className='text-base py-2 font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500' placeholder='Nhập địa chỉ' />
                            </Form.Item>
                            <Form.Item name='note'>
                                <TextArea name='note' rows={7} className='text-base font-medium dark:bg-slate-700 dark:text-white dark:hover:bg-slate-500 dark:focus:bg-slate-500' placeholder='Ghi chú' />
                            </Form.Item>
                            <Button type='primary' htmlType='submit' className='!h-24 !block !text-center !w-full'>
                                <h2 className='font-bold uppercase text-2xl'>Đặt hàng</h2>
                                <div className='text-sm '>Tư vấn viên sẽ gọi điện thoại để xác nhận</div>
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
