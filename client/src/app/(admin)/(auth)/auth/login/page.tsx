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
  const { setAccountLogin } = useAuthEmployee();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  const handleSubmit = async (payload: { IDEmp: string, password: string }) => {
    try {
      // Backend sets admin_access_token / admin_refresh_token httpOnly cookies.
      const response = await axios.post(`${API_BASE}/admin/auth/login`, payload, {
        withCredentials: true,
      });

      const data = response?.data?.data;
      const user = data?.user;

      if (!user?._id) {
        toast.error("Đăng nhập thất bại");
        return;
      }

      const role = await roleService.getById(user.roleId);

      setAccountLogin(
        {
          IDEmp: user.IDEmp,
          username: user.username,
          roleId: user.roleId,
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
