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
                    <h1 className="text-2xl font-bold m-0">HÆ°á»›ng dáº«n Ä‘Äƒng táº£i sáº£n pháº©m</h1>
                </div>
                <p className="text-blue-100 m-0">
                    HÆ°á»›ng dáº«n chi tiáº¿t tá»«ng bÆ°á»›c giÃºp báº¡n Ä‘Äƒng bÃ¡n sáº£n pháº©m hiá»‡u quáº£ trÃªn há»‡ thá»‘ng
                </p>
            </div>

            {/* Quick Overview */}
            <Card className="border-0 shadow-sm rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <InfoCircleOutlined className="text-blue-500" />
                    Tá»•ng quan quy trÃ¬nh
                </h2>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: <span className="font-medium">BÆ°á»›c 1: Táº¡o thuá»™c tÃ­nh sáº£n pháº©m</span>,
                            description: 'Táº¡o cÃ¡c thuá»™c tÃ­nh phÃ¢n biá»‡t nhÆ°: MÃ u sáº¯c, Dung lÆ°á»£ng RAM, KÃ­ch thÆ°á»›c...',
                            icon: <TagsOutlined className="text-blue-500" />,
                        },
                        {
                            title: <span className="font-medium">BÆ°á»›c 2: Táº¡o giÃ¡ trá»‹ cho thuá»™c tÃ­nh</span>,
                            description: 'ThÃªm cÃ¡c giÃ¡ trá»‹ cá»¥ thá»ƒ: Äá», Xanh, 8GB, 16GB, Size S, M, L...',
                            icon: <AppstoreOutlined className="text-purple-500" />,
                        },
                        {
                            title: <span className="font-medium">BÆ°á»›c 3: ÄÄƒng sáº£n pháº©m</span>,
                            description: 'Äiá»n thÃ´ng tin â†’ Chá»n thuá»™c tÃ­nh & giÃ¡ trá»‹ â†’ Cáº¥u hÃ¬nh biáº¿n thá»ƒ â†’ Xem láº¡i & Ä‘Äƒng',
                            icon: <ShoppingOutlined className="text-green-500" />,
                        },
                    ]}
                />
            </Card>

            {/* Step 1: Create Attributes */}
            <Card className="border-0 shadow-sm rounded-xl" id="step1">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="blue" className="m-0">BÆ°á»›c 1</Tag>
                    Táº¡o thuá»™c tÃ­nh sáº£n pháº©m
                </h2>
                <p className="text-gray-600 mb-4">
                    Thuá»™c tÃ­nh sáº£n pháº©m lÃ  cÃ¡c Ä‘áº·c Ä‘iá»ƒm giÃºp phÃ¢n biá»‡t cÃ¡c phiÃªn báº£n khÃ¡c nhau cá»§a cÃ¹ng má»™t sáº£n pháº©m.
                    Má»—i thuá»™c tÃ­nh cÃ³ má»™t <strong>kiá»ƒu hiá»ƒn thá»‹</strong> riÃªng.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                        <Tag color="magenta" className="mb-1">COLOR</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiá»ƒn thá»‹ Ã´ mÃ u â€¢ DÃ¹ng cho: MÃ u sáº¯c sáº£n pháº©m</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <Tag color="green" className="mb-1">IMAGE</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiá»ƒn thá»‹ hÃ¬nh áº£nh â€¢ DÃ¹ng cho: Máº«u hoa vÄƒn, há»a tiáº¿t</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Tag color="blue" className="mb-1">BUTTON</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiá»ƒn thá»‹ nÃºt báº¥m â€¢ DÃ¹ng cho: RAM, SSD, Size Ã¡o</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <Tag color="orange" className="mb-1">RADIO</Tag>
                        <p className="text-sm text-gray-600 m-0">Hiá»ƒn thá»‹ radio â€¢ DÃ¹ng cho: CÃ³/KhÃ´ng, Nam/Ná»¯</p>
                    </div>
                </div>

                <Alert
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    message="Thuá»™c tÃ­nh cá»§a báº¡n lÃ  riÃªng tÆ°"
                    description="Má»—i ngÆ°á»i bÃ¡n cÃ³ há»‡ thá»‘ng thuá»™c tÃ­nh riÃªng. KhÃ´ng ai khÃ¡c cÃ³ thá»ƒ xem, sá»­a hoáº·c xÃ³a thuá»™c tÃ­nh cá»§a báº¡n."
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product/attributes"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <TagsOutlined /> Äi Ä‘áº¿n trang quáº£n lÃ½ thuá»™c tÃ­nh â†’
                    </Link>
                </div>
            </Card>

            {/* Step 2: Create Attribute Values */}
            <Card className="border-0 shadow-sm rounded-xl" id="step2">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="purple" className="m-0">BÆ°á»›c 2</Tag>
                    Táº¡o giÃ¡ trá»‹ cho thuá»™c tÃ­nh
                </h2>
                <p className="text-gray-600 mb-4">
                    Sau khi táº¡o thuá»™c tÃ­nh, báº¡n cáº§n thÃªm cÃ¡c <strong>giÃ¡ trá»‹ cá»¥ thá»ƒ</strong> cho má»—i thuá»™c tÃ­nh.
                    VÃ­ dá»¥: thuá»™c tÃ­nh &quot;MÃ u sáº¯c&quot; cÃ³ cÃ¡c giÃ¡ trá»‹: Äá», Xanh, Äen, Tráº¯ng.
                </p>

                <div className="space-y-3 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800 m-0 mb-1">VÃ­ dá»¥ thá»±c táº¿:</p>
                        <ul className="text-sm text-gray-600 m-0 pl-4 space-y-1">
                            <li>Thuá»™c tÃ­nh <Tag color="magenta" className="mx-1">MÃ u sáº¯c</Tag>â†’ GiÃ¡ trá»‹: ðŸ”´ Äá», ðŸ”µ Xanh dÆ°Æ¡ng, âš« Äen</li>
                            <li>Thuá»™c tÃ­nh <Tag color="blue" className="mx-1">Dung lÆ°á»£ng</Tag>â†’ GiÃ¡ trá»‹: 128GB, 256GB, 512GB, 1TB</li>
                            <li>Thuá»™c tÃ­nh <Tag color="blue" className="mx-1">RAM</Tag>â†’ GiÃ¡ trá»‹: 8GB, 16GB, 32GB</li>
                        </ul>
                    </div>
                </div>

                <Alert
                    type="warning"
                    showIcon
                    message="LÆ°u Ã½ quan trá»ng"
                    description={
                        <ul className="m-0 pl-4 text-sm space-y-1">
                            <li>Vá»›i kiá»ƒu <strong>COLOR</strong>: Báº¡n cáº§n chá»n mÃ£ mÃ u hex (vÃ­ dá»¥: #FF0000)</li>
                            <li>Vá»›i kiá»ƒu <strong>IMAGE</strong>: Báº¡n cáº§n táº£i áº£nh lÃªn Cloudinary</li>
                            <li>GiÃ¡ trá»‹ <em>value</em> mang tÃ­nh ká»¹ thuáº­t (red, blue), cÃ²n <em>label</em> lÃ  tÃªn hiá»ƒn thá»‹ (MÃ u Ä‘á», Xanh dÆ°Æ¡ng)</li>
                        </ul>
                    }
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product/attribute-values"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        <AppstoreOutlined /> Äi Ä‘áº¿n trang quáº£n lÃ½ giÃ¡ trá»‹ â†’
                    </Link>
                </div>
            </Card>

            {/* Step 3: Create Product */}
            <Card className="border-0 shadow-sm rounded-xl" id="step3">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Tag color="green" className="m-0">BÆ°á»›c 3</Tag>
                    ÄÄƒng sáº£n pháº©m
                </h2>
                <p className="text-gray-600 mb-4">
                    Khi Ä‘Ã£ cÃ³ thuá»™c tÃ­nh vÃ  giÃ¡ trá»‹, báº¡n tiáº¿n hÃ nh Ä‘Äƒng sáº£n pháº©m vá»›i quy trÃ¬nh 4 bÆ°á»›c:
                </p>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">ThÃ´ng tin sáº£n pháº©m</p>
                            <p className="text-sm text-gray-500 m-0">Nháº­p tÃªn, mÃ´ táº£ chi tiáº¿t (há»— trá»£ copy/paste tá»« web), chá»n danh má»¥c & thÆ°Æ¡ng hiá»‡u</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Chá»n thuá»™c tÃ­nh & giÃ¡ trá»‹</p>
                            <p className="text-sm text-gray-500 m-0">Chá»n thuá»™c tÃ­nh â†’ Tick giÃ¡ trá»‹ muá»‘n Ã¡p dá»¥ng â†’ Há»‡ thá»‘ng tá»± tÃ­nh sá»‘ biáº¿n thá»ƒ</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Cáº¥u hÃ¬nh biáº¿n thá»ƒ</p>
                            <p className="text-sm text-gray-500 m-0">Thiáº¿t láº­p giÃ¡, khuyáº¿n mÃ£i, tá»“n kho, táº£i áº£nh sáº£n pháº©m lÃªn cho tá»«ng biáº¿n thá»ƒ</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</div>
                        <div>
                            <p className="font-medium text-gray-800 m-0">Xem láº¡i & ÄÄƒng bÃ¡n</p>
                            <p className="text-sm text-gray-500 m-0">Kiá»ƒm tra tá»•ng quan sáº£n pháº©m, xem trÆ°á»›c biáº¿n thá»ƒ rá»“i nháº¥n &quot;ÄÄƒng sáº£n pháº©m&quot;</p>
                        </div>
                    </div>
                </div>

                <Divider />

                <Alert
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    message="Máº¹o: Táº£i áº£nh tá»« mÃ¡y tÃ­nh"
                    description="á»ž bÆ°á»›c cáº¥u hÃ¬nh biáº¿n thá»ƒ, báº¡n cÃ³ thá»ƒ táº£i áº£nh trá»±c tiáº¿p tá»« mÃ¡y tÃ­nh lÃªn Cloudinary. áº¢nh sáº½ Ä‘Æ°á»£c lÆ°u trá»¯ an toÃ n vÃ  tá»± Ä‘á»™ng tá»‘i Æ°u dung lÆ°á»£ng."
                    className="rounded-lg"
                />

                <div className="mt-4">
                    <Link
                        href="/create-product"
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                    >
                        <ShoppingOutlined /> Báº¯t Ä‘áº§u Ä‘Äƒng sáº£n pháº©m â†’
                    </Link>
                </div>
            </Card>

            {/* FAQ Section */}
            <Card className="border-0 shadow-sm rounded-xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <SettingOutlined className="text-gray-500" />
                    CÃ¢u há»i thÆ°á»ng gáº·p
                </h2>

                <div className="space-y-4">
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Thuá»™c tÃ­nh cá»§a tÃ´i cÃ³ bá»‹ ngÆ°á»i khÃ¡c tháº¥y khÃ´ng?</p>
                        <p className="text-sm text-gray-500 m-0">KhÃ´ng. Má»—i ngÆ°á»i bÃ¡n cÃ³ há»‡ thá»‘ng thuá»™c tÃ­nh riÃªng vÃ  hoÃ n toÃ n tÃ¡ch biá»‡t.</p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Biáº¿n thá»ƒ lÃ  gÃ¬?</p>
                        <p className="text-sm text-gray-500 m-0">
                            Biáº¿n thá»ƒ lÃ  tá»• há»£p cÃ¡c giÃ¡ trá»‹ thuá»™c tÃ­nh. VÃ­ dá»¥: sáº£n pháº©m cÃ³ thuá»™c tÃ­nh MÃ u sáº¯c (Äá», Xanh) vÃ  RAM (8GB, 16GB) thÃ¬ sáº½ cÃ³ 2Ã—2 = 4 biáº¿n thá»ƒ.
                        </p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">áº¢nh sáº£n pháº©m lÆ°u á»Ÿ Ä‘Ã¢u?</p>
                        <p className="text-sm text-gray-500 m-0">
                            áº¢nh Ä‘Æ°á»£c táº£i lÃªn vÃ  lÆ°u trá»¯ trÃªn Cloudinary â€” dá»‹ch vá»¥ lÆ°u trá»¯ áº£nh chuyÃªn nghiá»‡p, tá»± Ä‘á»™ng tá»‘i Æ°u dung lÆ°á»£ng vÃ  CDN trÃªn toÃ n cáº§u.
                        </p>
                    </div>
                    <Divider className="my-2" />
                    <div>
                        <p className="font-medium text-gray-800 m-0 mb-1">Sáº£n pháº©m bao lÃ¢u sáº½ hiá»ƒn thá»‹ trÃªn cá»­a hÃ ng?</p>
                        <p className="text-sm text-gray-500 m-0">
                            Sau khi Ä‘Äƒng thÃ nh cÃ´ng, sáº£n pháº©m sáº½ Ä‘Æ°á»£c duyá»‡t vÃ  hiá»ƒn thá»‹ trong 24 giá».
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
