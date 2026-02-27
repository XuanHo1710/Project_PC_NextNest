import { FaFacebook, FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { HiShieldCheck } from "react-icons/hi";

export default function FooterClient() {
    return (
        <footer className="bg-gray-800 text-white">
            {/* Newsletter section */}
            <div className="px-5 xl:px-32 pt-10 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-gray-600 pb-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-2">Arisu Store</h2>
                        <p className="text-gray-400 text-sm mb-4 max-w-md">
                            Há»‡ thá»‘ng bÃ¡n láº» PC, Laptop vÃ  phá»¥ kiá»‡n cÃ´ng nghá»‡ hÃ ng Ä‘áº§u. Cam káº¿t chÃ­nh hÃ£ng, giÃ¡ tá»‘t nháº¥t thá»‹ trÆ°á»ng.
                        </p>
                        <div className="flex items-center mt-3 max-w-md">
                            <input
                                className="px-4 py-2.5 bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-400 transition-all text-white placeholder-blue-200/40 w-full rounded-l-lg text-sm"
                                placeholder="Nháº­p email Ä‘á»ƒ nháº­n Æ°u Ä‘Ã£i"
                            />
                            <button className="bg-blue-500 hover:bg-blue-400 transition-colors font-semibold px-5 py-2.5 rounded-r-lg text-sm whitespace-nowrap">
                                ÄÄƒng kÃ½
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MdEmail className="text-blue-400" /> Há»£p TÃ¡c PhÃ¡t Triá»ƒn
                        </h3>
                        <p className="text-blue-400 font-medium break-words cursor-pointer hover:text-blue-300 transition-colors text-sm">
                            xuanhodcbas@gmail.com
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MdPhone className="text-blue-400" /> Hotline
                        </h3>
                        <p className="text-blue-400 font-medium cursor-pointer hover:text-blue-300 transition-colors text-sm">
                            1800 2097 (Miá»…n phÃ­)
                        </p>
                    </div>
                </div>
            </div>

            {/* Main footer links */}
            <div className="px-5 xl:px-32 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Há»— trá»£ khÃ¡ch hÃ ng</h3>
                        <div className="w-10 h-0.5 bg-blue-500 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">HÆ°á»›ng dáº«n mua hÃ ng Online</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">HÆ°á»›ng dáº«n thanh toÃ¡n</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">HÆ°á»›ng dáº«n mua tráº£ gÃ³p</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Tra cá»©u Ä‘Æ¡n hÃ ng</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">ThÃ´ng tin Arisu</h3>
                        <div className="w-10 h-0.5 bg-blue-500 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Giá»›i thiá»‡u Arisu</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Há»‡ thá»‘ng showroom</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">ThÃ´ng tin liÃªn há»‡</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Tuyá»ƒn dá»¥ng</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Tin tá»©c cÃ´ng nghá»‡</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">ChÃ­nh sÃ¡ch</h3>
                        <div className="w-10 h-0.5 bg-blue-500 mb-4 rounded-full"></div>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">ChÃ­nh sÃ¡ch báº£o hÃ nh</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">ChÃ­nh sÃ¡ch báº£o máº­t</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">ChÃ­nh sÃ¡ch váº­n chuyá»ƒn</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">ChÃ­nh sÃ¡ch Ä‘á»•i tráº£</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-base mb-4 text-white">Káº¿t ná»‘i vá»›i chÃºng tÃ´i</h3>
                        <div className="w-10 h-0.5 bg-blue-500 mb-4 rounded-full"></div>
                        <div className="flex gap-3 mb-4">
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                <FaFacebook />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                <FaTiktok />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                <FaYoutube />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-500 transition-colors">
                                <FaInstagram />
                            </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MdLocationOn className="text-blue-400 flex-shrink-0" />
                            <span>TÃ²a nhÃ  Arisu, HÃ  Ná»™i</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-gray-900 px-5 xl:px-32 py-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="text-center md:text-left">
                        <p className="font-semibold text-sm flex items-center gap-2">
                            <HiShieldCheck className="text-blue-400" />
                            ARISU STORE Â© {new Date().getFullYear()}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Táº¥t cáº£ quyá»n Ä‘Æ°á»£c báº£o lÆ°u. Báº£n quyá»n thuá»™c vá» Arisu Store.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <a href="#" className="hover:text-white transition-colors">Äiá»u khoáº£n sá»­ dá»¥ng</a>
                        <span>|</span>
                        <a href="#" className="hover:text-white transition-colors">ChÃ­nh sÃ¡ch báº£o máº­t</a>
                        <span>|</span>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}