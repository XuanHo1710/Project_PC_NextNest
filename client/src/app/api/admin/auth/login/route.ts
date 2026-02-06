import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`,
      body,
      { withCredentials: true },
    );

    const { data } = backendRes.data;

    // Build response with account info (without tokens in body)
    const responseData = {
      statusCode: 200,
      message: "Đăng nhập thành công",
      data: {
        payload: data.payload,
      },
    };

    const response = NextResponse.json(responseData, { status: 200 });

    // Set admin_access_token as httpOnly cookie
    if (data.access_token) {
      response.cookies.set("admin_access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string; statusCode?: number } };
    };
    const status = axiosError.response?.data?.statusCode || 500;
    const message = axiosError.response?.data?.message || "Đăng nhập thất bại";

    return NextResponse.json({ message, statusCode: status }, { status });
  }
}
