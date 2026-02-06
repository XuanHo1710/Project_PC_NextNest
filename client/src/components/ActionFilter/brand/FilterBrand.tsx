'use client'
import { useQueryParams } from '@/hooks/QueryParamsContext';
import { Button, Form, Input, Select } from "antd";
import { FaSearch } from 'react-icons/fa';

export default function FilterBrand() {
    const { queryParams, setQueryParams } = useQueryParams();
    const [form] = Form.useForm();

    const handleFilter = (values: { keyword?: string; status?: string }) => {
        // Giữ lại các params hiện tại (như sort)
        const params = new URLSearchParams(queryParams.toString());

        // Xóa keyword cũ nếu có
        params.delete('keyword');
        params.delete('status');

        if (values.keyword && values.keyword.trim()) {
            params.set('keyword', values.keyword.trim());
        }
        if (values.status) {
            params.set('status', values.status);
        }

        setQueryParams(params);
    };

    const handleReset = () => {
        form.resetFields();
        // Giữ lại sort, xóa các filter
        const params = new URLSearchParams(queryParams.toString());
        params.delete('keyword');
        params.delete('status');
        setQueryParams(params);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h3 className="text-base font-semibold mb-3">Bộ lọc</h3>
            <Form
                form={form}
                layout="inline"
                onFinish={handleFilter}
                className="flex flex-wrap gap-2"
            >
                <Form.Item name="keyword" className="mb-2">
                    <Input
                        placeholder="Tìm theo tên thương hiệu"
                        prefix={<FaSearch className="text-gray-400" />}
                        allowClear
                        style={{ width: 250 }}
                    />
                </Form.Item>

                <Form.Item name="status" className="mb-2">
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: 150 }}
                    >
                        <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                        <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item className="mb-2">
                    <Button type="primary" htmlType="submit">
                        Tìm kiếm
                    </Button>
                </Form.Item>

                <Form.Item className="mb-2">
                    <Button onClick={handleReset}>
                        Đặt lại
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
