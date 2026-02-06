'use client'
import { Form, Input, Button, Avatar, Upload, message, Select, Row, Col } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import useAuthEmployee from '@/hooks/AuthEmployeeContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '@/config/axios';

const { Option } = Select;

interface Province {
    code: number;
    name: string;
    districts?: District[];
}
interface District {
    code: number;
    name: string;
    wards?: Ward[];
}
interface Ward {
    code: number;
    name: string;
}

export default function ProfileDetails() {
    const { accountLogin } = useAuthEmployee();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // State cho địa chỉ
    const [cities, setCities] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/?depth=1');
                setCities(res.data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };
        fetchCities();
    }, []);

    // Set initial values from accountLogin
    useEffect(() => {
        if (accountLogin) {
            const acc = accountLogin as any;
            const address = acc.addresses && acc.addresses.length > 0 ? acc.addresses[0] : null;

            console.log(acc)
            form.setFieldsValue({
                IDEmp: acc.IDEmp,
                name: acc.name,
                email: acc.email,
                age: acc.age,
                gender: acc.gender,
                city: address?.province?.code,
                district: address?.district?.code,
                ward: address?.ward?.code,
                addressDetail: address?.detailAddress
            });

            if (address?.province?.code) handleCityChange(address.province.code, false);
            if (address?.district?.code) handleDistrictChange(address.district.code, false);
        }
    }, [accountLogin]);

    const handleCityChange = async (value: number, resetChild = true) => {
        if (resetChild) {
            form.setFieldsValue({ district: undefined, ward: undefined });
            setDistricts([]);
            setWards([]);
        }
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${value}?depth=2`);
            setDistricts(res.data.districts || []);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const handleDistrictChange = async (value: number, resetChild = true) => {
        if (resetChild) {
            form.setFieldsValue({ ward: undefined });
            setWards([]);
        }
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${value}?depth=2`);
            setWards(res.data.wards || []);
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        const { city, district, ward, addressDetail, ...otherValues } = values;

        // Find names
        const provinceData = cities.find(c => c.code === city);
        const districtData = districts.find(d => d.code === district);
        const wardData = wards.find(w => w.code === ward);

        const newAddress = {
            label: 'Văn phòng',
            province: { code: city, name: provinceData?.name || '' },
            district: { code: district, name: districtData?.name || '' },
            ward: { code: ward, name: wardData?.name || '' },
            detailAddress: addressDetail,
            isDefault: true
        };

        const payload = {
            ...otherValues,
            addresses: [newAddress],
        };

        try {
            await axiosInstance.patch('/auth/profile', payload);
            message.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            console.error(error);
            message.error(error?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full py-6">
            <div className="flex flex-col items-center mb-8">
                <Avatar
                    size={100}
                    src={(accountLogin as any)?.avatar}
                    icon={<UserOutlined />}
                    className="mb-4 bg-blue-500"
                />
                <div className="text-gray-500 text-sm">Ảnh đại diện</div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Mã nhân viên" name="IDEmp">
                            <Input disabled className="bg-gray-100" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: 'Không được để trống' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="Email" name="email">
                            <Input disabled className="bg-gray-100" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item label="Tuổi" name="age">
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item label="Giới tính" name="gender">
                            <Select>
                                <Option value="MALE">Nam</Option>
                                <Option value="FEMALE">Nữ</Option>
                                <Option value="OTHER">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-medium mb-4">Địa chỉ</h3>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Tỉnh/Thành phố" name="city">
                                <Select
                                    placeholder="Chọn Tỉnh/Thành"
                                    onChange={(v) => handleCityChange(v)}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {cities.map((city) => (
                                        <Option key={city.code} value={city.code}>{city.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Quận/Huyện" name="district">
                                <Select
                                    placeholder="Chọn Quận/Huyện"
                                    onChange={(v) => handleDistrictChange(v)}
                                    disabled={!districts.length}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {districts.map((d) => (
                                        <Option key={d.code} value={d.code}>{d.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Phường/Xã" name="ward">
                                <Select
                                    placeholder="Chọn Phường/Xã"
                                    disabled={!wards.length}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {wards.map((w) => (
                                        <Option key={w.code} value={w.code}>{w.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Địa chỉ cụ thể" name="addressDetail">
                        <Input.TextArea rows={2} placeholder="Nhập số nhà, tên đường..." />
                    </Form.Item>
                </div>

                <Form.Item className="mt-6 text-right">
                    <Button type="primary" htmlType="submit" size="large" loading={loading}>
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
