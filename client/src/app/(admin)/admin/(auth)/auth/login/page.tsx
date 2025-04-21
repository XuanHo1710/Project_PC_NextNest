'use client'
import { Button, Form, Input } from "antd";


export default function AuthLogin() {
  const layout = {
    labelCol: {
        span: 4,
    },
    wrapperCol: {
        span: 25,
    },
};

  return (
    <>
    <div className="mt-32 w-1/3 mx-auto p-10 rounded-2xl shadow-lg border-solid border-2 border-slate-200">
       <h2 className="font-semibold mb-10 pb-3 border-b-2 border-slate-200 text-2xl text-center">Login admin</h2>
        <Form  {...layout}>
          <Form.Item label="Username" name="username">
            <Input placeholder="Nhập tên đăng nhập" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Nhập mật khẩu đăng nhập" />
          </Form.Item>
          <Button type="primary" className="w-full">Đăng nhập</Button>
        </Form>
    </div>
    </>
  );
}
