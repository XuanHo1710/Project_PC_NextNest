import { Image } from "antd";

export default function FooterClient() {
    return (
        <>
            <footer style={{ backgroundColor: "#0062b9" }} className="grid grid-flow-row grid-cols-6 lg:grid-cols-12 gap-2 pt-9 text-white">
                <div className="col-span-6 gap-2 lg:col-span-12 px-5 xl:px-32 grid grid-flow-row grid-cols-6 lg:grid-cols-12">
                    <div className="col-span-6 lg:col-span-8 xl:col-span-6">
                        <h2 className="font-bold mb-3">Email liên hệ</h2>
                        <p className="w-3/4 text-justify">Vui lòng liên hệ phía bên dưới</p>
                        <div className="flex items-center mt-3 my-4">
                            <input className="px-3 py-2 bg-white focus:outline-blue-300 transition-all text-black w-full xl:w-3/5 rounded-lg" placeholder="Enter your Email" />
                            <button className="bg-sky-500 mx-2 font-semibold px-3 py-2 rounded-md">Send</button>
                        </div>
                    </div>
                    <div className='lg:col-span-4 xl:col-span-2 col-span-3 '>
                        <h2 className='font-semibold mb-3'>Hợp Tác Phát Triển:</h2>
                        <p className='font-bold break-words cursor-pointer text-sky-300'>xuanhodcbas@gmail.com</p>
                    </div>
                    <div className='lg:col-span-6 xl:col-span-2 col-span-3'>
                        <h2 className='font-semibold mb-3'>Liên Hệ Báo Giá:</h2>
                        <p className='font-bold break-words cursor-pointer text-sky-300'>xuanhodcbas@gmail.com</p>
                    </div>
                    <div className='lg:col-span-6 xl:col-span-2 col-span-6 mt-4 lg:mt-0'>
                        <h2 className='font-semibold mb-3'>Hỗ Trợ Bảo Hành:</h2>
                        <p className='font-bold break-words cursor-pointer text-sky-300'>xuanhodcbas@gmail.com</p>
                    </div>
                    <div className='col-span-3 '>
                        <h2 className='font-bold text-base lg:text-xl mt-10'>Hỗ trợ khách hàng</h2>
                        <p className='font-bold border-solid w-3/5 border-white my-3 border-2'></p>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hướng dẫn mua hàng Online</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hướng dẫn thanh toán</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hướng dẫn mua trả góp</div>
                    </div>
                    <div className='col-span-3 '>
                        <h2 className='font-bold text-base lg:text-xl mt-10'>Thông tin Hoàng Hà PC</h2>
                        <p className='font-bold border-solid w-3/5 border-white my-3 border-2'></p>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Giới thiệu Hoàng Hà PC</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hệ thống showroom</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Thông tin liên hệ</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Tuyển dụng</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Tin tức</div>
                    </div>
                    <div className='col-span-3 '>
                        <h2 className='font-bold text-base lg:text-xl mt-10'>Cộng đồng Hoàng Hà PC</h2>
                        <p className='font-bold border-solid w-3/5 border-white my-3 border-2'></p>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hoàng Hà PC Fanpage</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hoàng Hà PC Group</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hoàng Hà PC Tik Tok</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Hoàng Hà Media</div>

                    </div>
                    <div className='col-span-3 '>
                        <h2 className='font-bold text-base lg:text-xl mt-10'>Chính sách mua và bảo hành</h2>
                        <p className='font-bold border-solid w-3/5 border-white my-3 border-2'></p>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Chính sách bảo hành</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Chính sách bảo mật</div>
                        <div className='font-medium hover:text-sky-300 my-2 cursor-pointer text-base'>Chính sách vận chuyển, giao nhận</div>
                    </div>
                </div>
                <div className='col-span-6 lg:col-span-12 mt-10 px-5 xl:px-32 py-9 lg:flex items-center justify-between' style={{ backgroundColor: "#005098" }}>
                    <div className='w-full font-bold'>
                        <h2>CÔNG TY TNHH DỊCH VỤ VÀ CÔNG NGHỆ HOÀNG HÀ ©</h2>
                        <p className='my-4 font-medium'>2008 - 2020 - Công ty TNHH Dịch Vụ Và Công Nghệ Hoàng Hà / GPKD số: 0107406972 Do Sở Kế Hoạch Và Đầu Tư Thành Phố Hà Nội Cấp
                            Bản Quyền Thuộc Về hoanghapc.vn</p>
                    </div>
                    <Image preview={false} width={250} src="https://hoanghapc.vn/static/assets/2022/images/bct.png" alt="logo" />
                </div>
            </footer>
        </>
    )
}