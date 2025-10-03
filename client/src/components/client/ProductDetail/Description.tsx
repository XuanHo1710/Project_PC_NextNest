'use client';

import { IProductCard } from "@/types/model.client";
import { Image } from "antd";

export default function DescriptionProduct({ product }: { product: IProductCard }) {

    return (
        <>
            <div className="prose max-w-none dark:prose-invert">
                <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">Giới thiệu {product.name}</h3>
                {/* Thêm mô tả demo */}
                <p className="my-4">
                    {product.name} là sự lựa chọn hoàn hảo cho những người dùng tìm kiếm một chiếc máy tính có hiệu năng mạnh mẽ.
                    Được trang bị bộ vi xử lý Intel Core i5 12600K với 10 nhân và 16 luồng,
                    máy tính này có thể xử lý mọi tác vụ từ công việc văn phòng đến các game đòi hỏi cấu hình cao.
                </p>

                <div className="my-6 text-center">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        className="rounded-lg inline-block shadow-md"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hình ảnh {product.name}</p>
                </div>

                <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Hiệu năng vượt trội</h4>
                <p>
                    Với card đồ họa GIGABYTE RTX 3060 WINDFORCE OC 12G GDDR6, máy tính này có khả năng xử lý hình ảnh mượt mà,
                    đáp ứng nhu cầu chơi game ở độ phân giải cao hoặc làm việc với các phần mềm đồ họa chuyên nghiệp.
                    Bộ nhớ RAM 16GB DDR4 3200MHz cùng ổ cứng SSD TEAMGROUP MP33 PRO 512GB M.2 PCIe Gen3x4
                    giúp máy khởi động nhanh chóng và làm việc đa nhiệm mượt mà.
                </p>

                <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Thiết kế hiện đại</h4>
                <p>
                    Case XIGMATEK GAMING X II 3F với 3 quạt RGB không chỉ mang đến vẻ ngoài bắt mắt mà còn đảm bảo
                    khả năng tản nhiệt hiệu quả. Mainboard GIGABYTE B760M GAMING X DDR4 cung cấp đầy đủ cổng kết nối và
                    khả năng nâng cấp trong tương lai. Nguồn FSP650-70ALA 650W với chứng nhận 80 PLUS GOLD đảm bảo
                    hiệu suất cao và độ bền lâu dài.
                </p>

                <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-6 mb-3">Ưu điểm nổi bật</h4>
                <ul className="list-disc pl-6">
                    <li>CPU Intel Core i5 12600K mạnh mẽ với 10 nhân 16 luồng, xung nhịp tối đa 4.9GHz</li>
                    <li>Card đồ họa RTX 3060 12GB GDDR6 cho trải nghiệm chơi game và xử lý đồ họa tuyệt vời</li>
                    <li>RAM 16GB DDR4 3200MHz với khả năng nâng cấp mở rộng</li>
                    <li>SSD NVMe 512GB với tốc độ đọc/ghi lên đến 3500MB/s</li>
                    <li>Hệ thống tản nhiệt hiệu quả với quạt ARGB hiện đại</li>
                    <li>Bảo hành chính hãng lên đến 36 tháng cho các linh kiện chính</li>
                </ul>

                <hr className="my-6 border-gray-200 dark:border-gray-600" />

                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {product.name} là sự lựa chọn tuyệt vời cho những ai đang tìm kiếm một chiếc PC gaming hiệu năng cao
                    với mức giá hợp lý. Ngoài ra, chúng tôi còn đi kèm nhiều ưu đãi hấp dẫn như giảm giá khi mua kèm
                    màn hình và RAM, cùng bộ phần mềm bản quyền trị giá hơn 1 triệu đồng.
                </p>
            </div>
        </>
    );
}