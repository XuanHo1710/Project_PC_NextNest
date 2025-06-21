'use client'
import { IAccountEmployee } from "@/stores/accountEmployeeStore";
import { Button, Form, Input } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import useAuthEmployee from "@/hooks/AuthEmployeeContext";


export default function AuthLogin() {
  const router = useRouter();
  const { setAccessToken, setAccountLogin } = useAuthEmployee();
  const handleSubmit = async (payload: { IDEmp: string, password: string }) => {
    await axios.post("http://localhost:8080/api/v1/admin/auth/login", payload, {
      withCredentials: true
    }).catch(error => {
      const { data } = error.response;
      toast.error(data.message);
    }).then(async (response) => {
      setAccessToken(response?.data.access_token || "");
      sessionStorage.setItem("token", response?.data.access_token);
      const res = await axios.post("http://localhost:8080/api/v1/admin/account-employee/token-account", { token: response?.data.refresh_token });
      setAccountLogin(res.data as IAccountEmployee);
      router.push("/admin/dashboard"); // 👈 Đường dẫn muốn chuyển
    })
  }

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
        <h2 className="font-semibold mb-10 pb-3 border-b-2 border-slate-200 text-2xl text-center">LOGIN ADMIN</h2>
        <Form onFinish={handleSubmit}  {...layout}>
          <Form.Item label="ID" name="IDEmp">
            <Input placeholder="Nhập mã nhân viên" />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password placeholder="Nhập mật khẩu đăng nhập" />
          </Form.Item>
          <Button htmlType="submit" type="primary" className="w-full">Đăng nhập</Button>
        </Form>
      </div>
    </>
  );
}
