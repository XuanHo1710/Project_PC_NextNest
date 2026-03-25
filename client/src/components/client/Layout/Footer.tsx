import { FaFacebook, FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { HiShieldCheck } from "react-icons/hi";

export default function FooterClient() {
    return (
        <footer className="bg-[#0062b9] text-white">
            {/* Newsletter section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-blue-400/30 pb-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-2">Arisu Store</h2>
                        <p className="text-blue-200 text-sm mb-4 max-w-md">
                            Hệ thống bán lẻ PC, Laptop và phụ kiện công nghệ hàng đầu. Cam kết chính hãng, giá tốt nhất thị trường.
                        </p>
                        <div className="flex items-center mt-3 max-w-md">
                            <input
                                className="px-4 py-2.5 bg-white border border-blue-400/30 focus:outline-none focus:border-blue-300 transition-all text-black placeholder-gray-300 w-full rounded-l-lg text-sm"
                                placeholder="Nhập email để nhận ưu đãi"
                            />
                            <button className="bg-blue-400 hover:bg-blue-300 transition-colors font-semibold px-5 py-2.5 rounded-r-lg text-sm whitespace-nowrap">
                                Đăng ký
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MdEmail className="text-blue-300" /> Hợp Tác Phát Triển
                        </h3>
                        <p className="text-blue-200 font-medium break-words cursor-pointer hover:text-white transition-colors text-sm">
                            xuanhodcbas@gmail.com
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MdPhone className="text-blue-300" /> Hotline
                        </h3>
                        <p className="text-blue-200 font-medium cursor-pointer hover:text-white transition-colors text-sm">
                            1800 2097 (Miễn phí)
                        </p>
                    </div>
                </div>
            </div>

            {/* Main footer links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Hỗ trợ khách hàng</h3>
                        <div className="w-10 h-0.5 bg-blue-400 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Hướng dẫn mua hàng Online</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Hướng dẫn thanh toán</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Hướng dẫn mua trả góp</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Tra cứu đơn hàng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Thông tin Arisu</h3>
                        <div className="w-10 h-0.5 bg-blue-400 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Giới thiệu Arisu</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Hệ thống showroom</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Thông tin liên hệ</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Tuyển dụng</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Tin tức công nghệ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Chính sách</h3>
                        <div className="w-10 h-0.5 bg-blue-400 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Chính sách bảo hành</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Chính sách bảo mật</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Chính sách vận chuyển</a></li>
                            <li><a href="#" className="text-blue-200 hover:text-white transition-colors text-sm">Chính sách đổi trả</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Kết nối với chúng tôi</h3>
                        <div className="w-10 h-0.5 bg-blue-400 mb-4 rounded-full"></div>
                        <div className="flex gap-3 mb-4">
                            <a href="#" className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <FaFacebook />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <FaTiktok />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <FaYoutube />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center hover:bg-blue-400 transition-colors">
                                <FaInstagram />
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-blue-200 text-sm">
                            <MdLocationOn className="text-blue-300 flex-shrink-0" />
                            <span>Tòa nhà Arisu, Hà Nội</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-[#004a85] py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="text-center md:text-left">
                            <p className="font-semibold text-sm flex items-center gap-2">
                                <HiShieldCheck className="text-blue-300" />
                                ARISU STORE © {new Date().getFullYear()}
                            </p>
                            <p className="text-blue-200 text-xs mt-1">
                                Tất cả quyền được bảo lưu. Bản quyền thuộc về Arisu Store.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-blue-200 text-xs">
                            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
                            <span>|</span>
                            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
                            <span>|</span>
                            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}