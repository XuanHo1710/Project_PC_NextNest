import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/client" ||
  "http://localhost:8080/api/v1/client";

/**
 * POST /api/client/auth/register
 * Registers new user via backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullname, phone } = body;

    if (!email || !password || !fullname || !phone) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 },
      );
    }

    // Call backend register API
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      fullname,
      phone,
    });

    const data = response.data?.data || response.data;

    return NextResponse.json({
      success: true,
      data,
      message:
        "Đăng ký thành công! Vui lòng xác thực email để kích hoạt tài khoản.",
    });
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    const message = axiosError.response?.data?.message || "Đăng ký thất bại";
    const status = axiosError.response?.status || 500;

    return NextResponse.json({ success: false, message }, { status });
  }
}
