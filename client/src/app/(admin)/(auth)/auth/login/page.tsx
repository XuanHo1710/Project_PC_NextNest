'use client'
import { Button, Form, Input } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import useAuthEmployee from "@/hooks/AuthEmployeeContext";
import { IAccountLogin } from "@/types/account-employee";
import { roleService } from "@/services/admin/role.service";


export default function AuthLogin() {
  const router = useRouter();
  const { setAccountLogin, setAccessToken } = useAuthEmployee();
  const handleSubmit = async (payload: { IDEmp: string, password: string }) => {
    try {
      // Call Next.js API route which sets admin_access_token httpOnly cookie
      const response = await axios.post("/api/admin/auth/login", payload);

      const { data } = response?.data;

      // Store access_token in Zustand so admin axios can attach it as Bearer token
      if (data.access_token) {
        setAccessToken(data.access_token);
      }

      console.log(data)

      const role = await roleService.getById(data.user.roleId);

      console.log(role)

      setAccountLogin(
        {
          IDEmp: data.user.IDEmp,
          username: data.user.username,
          roleId: data.user.roleId,
          role,
        } as IAccountLogin
      );
      router.push("/admin/dashboard");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || 'Đăng nhập thất bại');
    }
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
