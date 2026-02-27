'use client';

import React from 'react';
import { Card, Steps, Alert, Tag, Divider } from 'antd';
import {
    ShoppingOutlined,
    TagsOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    BulbOutlined,
    FileImageOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

export default function GuidePage() {
    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <BulbOutlined className="text-2xl" />
                    <h1 className="text-2xl font-bold m-0">Hướng dẫn đăng tải sản phẩm</h1>
                </div>
                <p className="text-blue-100 m-0">
                    Hướng dẫn chi tiết từng bước giúp bạn đăng bán sản phẩm hiệu quả trên hệ thống
                </p>
            </div>

            {/* Quick Overview */}
            <Card className="border-0 shadow-sm rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <InfoCircleOutlined className="text-blue-500" />
                    Tổng quan quy trình
                </h2>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: <span className="font-medium">Bước 1: Tạo thuộc tính sản phẩm</span>,
                            description: 'Tạo các thuộc tính phân biệt như: Màu sắc, Dung lượng RAM, Kích thước...',
                            icon: <TagsOutlined className="text-blue-500" />,
                        },
                        {
                            title: <span className="font-medium">Bước 2: Tạo giá trị cho thuộc tính</span>,
                            description: 'Thêm các giá trị cụ thể: Đỏ, Xanh, 8GB, 16GB, Size S, M, L...',
                            icon: <AppstoreOutlined className="text-purple-500" />,
                        },
                        {
                            title: <span className="font-medium">Bước 3: Đăng sản phẩm</span>,
                            description: 'Điền thông tin → Chọn thuộc tính & giá trị → Cấu hình biến thể → Xem lại & đăng',
                            icon: <ShoppingOutlined className="text-green-500" />,
                        },
                    ]}
                />
            </Card>

            {/* Step 1: Create Attributes */}
            <Card className="border-0 shadow-sm rounded-xl" id="step1">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="blue" className="m-0">Bước 1</Tag>
                    Tạo thuộc tính sản phẩm
                </h2>
                <p className="text-gray-600 mb-4">
                    Thuộc tính sản phẩm là các đặc điểm giúp phân biệt các phiên bản khác nhau của cùng một sản phẩm.
                    Mỗi thuộc tính có một <strong>kiểu hiển thị</strong> riêng.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                        <Tag color="magenta" className="mb-1">COLOR</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiển thị ô màu • Dùng cho: Màu sắc sản phẩm</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <Tag color="green" className="mb-1">IMAGE</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiển thị hình ảnh • Dùng cho: Mẫu hoa văn, họa tiết</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Tag color="blue" className="mb-1">BUTTON</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiển thị nút bấm • Dùng cho: RAM, SSD, Size áo</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <Tag color="orange" className="mb-1">RADIO</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiển thị radio • Dùng cho: Có/Không, Nam/Nữ</p>
                    </div>
                </div>

                <Alert
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    message="Thuộc tính của bạn là riêng tư"
                    description="Mỗi người bán có hệ thống thuộc tính riêng. Không ai khác có thể xem, sửa hoặc xóa thuộc tính của bạn."
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product/attributes"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <TagsOutlined /> Đi đến trang quản lý thuộc tính →
                    </Link>
                </div>
            </Card>

            {/* Step 2: Create Attribute Values */}
            <Card className="border-0 shadow-sm rounded-xl" id="step2">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="purple" className="m-0">Bước 2</Tag>
                    Tạo giá trị cho thuộc tính
                </h2>
                <p className="text-gray-600 mb-4">
                    Sau khi tạo thuộc tính, bạn cần thêm các <strong>giá trị cụ thể</strong> cho mỗi thuộc tính.
                    Ví dụ: thuộc tính &quot;Màu sắc&quot; có các giá trị: Đỏ, Xanh, Đen, Trắng.
                </p>

                <div className="space-y-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800 m-0 mb-1">Ví dụ thực tế:</p>
                        <ul className="text-sm text-gray-600 m-0 pl-4 space-y-1">
                            <li>Thuộc tính <Tag color="magenta" className="mx-1">Màu sắc</Tag>→ Giá trị: 🔴 Đỏ, 🔵 Xanh dương, ⚫ Đen</li>
                            <li>Thuộc tính <Tag color="blue" className="mx-1">Dung lượng</Tag>→ Giá trị: 128GB, 256GB, 512GB, 1TB</li>
                            <li>Thuộc tính <Tag color="blue" className="mx-1">RAM</Tag>→ Giá trị: 8GB, 16GB, 32GB</li>
                        </ul>
                    </div>
                </div>

                <Alert
                    type="warning"
                    showIcon
                    message="Lưu ý quan trọng"
                    description={
                        <ul className="m-0 pl-4 text-sm space-y-1">
                            <li>Với kiểu <strong>COLOR</strong>: Bạn cần chọn mã màu hex (ví dụ: #FF0000)</li>
                            <li>Với kiểu <strong>IMAGE</strong>: Bạn cần tải ảnh lên Cloudinary</li>
                            <li>Giá trị <em>value</em> mang tính kỹ thuật (red, blue), còn <em>label</em> là tên hiển thị (Màu đỏ, Xanh dương)</li>
                        </ul>
                    }
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product/attribute-values"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <AppstoreOutlined /> Đi đến trang quản lý giá trị →
                    </Link>
                </div>
            </Card>

            {/* Step 3: Create Product */}
            <Card className="border-0 shadow-sm rounded-xl" id="step3">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="green" className="m-0">Bước 3</Tag>
                    Đăng sản phẩm
                </h2>
                <p className="text-gray-600 mb-4">
                    Khi đã có thuộc tính và giá trị, bạn tiến hành đăng sản phẩm với quy trình 4 bước:
                </p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Thông tin sản phẩm</p>
                            <p className="text-sm text-gray-500 m-0">Nhập tên, mô tả chi tiết (hỗ trợ copy/paste từ web), chọn danh mục & thương hiệu</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Chọn thuộc tính & giá trị</p>
                            <p className="text-sm text-gray-500 m-0">Chọn thuộc tính → Tick giá trị muốn áp dụng → Hệ thống tự tính số biến thể</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Cấu hình biến thể</p>
                            <p className="text-sm text-gray-500 m-0">Thiết lập giá, khuyến mãi, tồn kho, tải ảnh sản phẩm lên cho từng biến thể</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Xem lại & Đăng bán</p>
                            <p className="text-sm text-gray-500 m-0">Kiểm tra tổng quan sản phẩm, xem trước biến thể rồi nhấn &quot;Đăng sản phẩm&quot;</p>
                        </div>
                    </div>
                </div>

                <Divider />

                <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    message="Mẹo: Tải ảnh từ máy tính"
                    description="Ở bước cấu hình biến thể, bạn có thể tải ảnh trực tiếp từ máy tính lên Cloudinary. Ảnh sẽ được lưu trữ an toàn và tự động tối ưu dung lượng."
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                        <ShoppingOutlined /> Bắt đầu đăng sản phẩm →
                    </Link>
                </div>
            </Card>

            {/* FAQ Section */}
            <Card className="border-0 shadow-sm rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <SettingOutlined className="text-gray-500" />
                    Câu hỏi thường gặp
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Thuộc tính của tôi có bị người khác thấy không?</p>
                        <p className="text-sm text-gray-500 m-0">Không. Mỗi người bán có hệ thống thuộc tính riêng và hoàn toàn tách biệt.</p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Biến thể là gì?</p>
                        <p className="text-sm text-gray-500 m-0">
                            Biến thể là tổ hợp các giá trị thuộc tính. Ví dụ: sản phẩm có thuộc tính Màu sắc (Đỏ, Xanh) và RAM (8GB, 16GB) thì sẽ có 2×2 = 4 biến thể.
                        </p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Ảnh sản phẩm lưu ở đâu?</p>
                        <p className="text-sm text-gray-500 m-0">
                            Ảnh được tải lên và lưu trữ trên Cloudinary — dịch vụ lưu trữ ảnh chuyên nghiệp, tự động tối ưu dung lượng và CDN trên toàn cầu.
                        </p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Sản phẩm bao lâu sẽ hiển thị trên cửa hàng?</p>
                        <p className="text-sm text-gray-500 m-0">
                            Sau khi đăng thành công, sản phẩm sẽ được duyệt và hiển thị trong 24 giờ.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
