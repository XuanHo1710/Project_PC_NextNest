"use client";

import Button from "@/components/common/Button";
import { Input } from "antd";
import { BiCategory } from "react-icons/bi";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { IoDocumentOutline } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";

export default function HeaderClient() {
    return (
        <>
            <header className="fixed z-50 pb-4 left-0 right-0 top-0 bg-amber-100">
                <div className="flex justify-center py-2 ">
                    <h5 className="flex text-sm items-center hover:text-xs transition-all cursor-pointer  hover:transition-all justify-center gap-2 border-l-2 border-slate-300 px-2"><FaStore /> Cửa hàng gần bạn</h5>
                    <h5 className="flex text-sm items-center hover:text-xs transition-all cursor-pointer  hover:transition-all justify-center gap-2 border-l-2 border-slate-300 px-2"><IoDocumentOutline /> Tra cứu đơn hàng</h5>
                    <h5 className="flex text-sm items-center hover:text-xs transition-all cursor-pointer  hover:transition-all justify-center gap-2 border-l-2 border-slate-300 px-2"><FaPhoneAlt /> 1800 2097</h5>

                </div>
                <div className="flex gap-5 py-1 items-center justify-center">
                    <h2 className="font-bold text-lg">Hoàng Hà PC</h2>
                    <Button position="left" icons={<BiCategory />} name="Danh mục" />
                    <Button position="left" icons={<MdOutlineNotListedLocation />} name="Hồ Chí Minh" />
                    <Input placeholder="Bạn muốn mua gì ngày hôm nay" className="!w-80 !py-2 px-2 font-semibold text-xl" />
                    <Button position="right" icons={<MdOutlineShoppingCart />} name="Giỏ hàng" />
                    <Button position="right" icons={<FaRegUserCircle />} name="Đăng nhập" />
                </div>
            </header>
        </>
    )
}