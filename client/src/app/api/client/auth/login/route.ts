import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "86400",
); // 24 hours default

/**
 * POST /api/client/auth/login
 * Receives credentials from client, calls backend, stores client_access_token in cookies
 * Backend manages refresh_token internally (Redis) — frontend only handles access_token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email và mật khẩu là bắt buộc" },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `${API_URL}/client/auth/login`,
      { email, password },
      { withCredentials: true },
    );

    const data = response.data?.data || response.data;

    if (!data?.access_token) {
      return NextResponse.json(
        { success: false, message: "Đăng nhập thất bại" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      success: true,
      data: {
        access_token: data.access_token,
        user: {
          _id: data.payload?._id,
          email: data.payload?.email,
          fullname: data.payload?.fullname,
          avatar: data.payload?.avatar,
          authProvider: data.payload?.authProvider,
          accountStatus: data.payload?.accountStatus,
        },
      },
    });

    // Set client_access_token cookie only — backend handles refresh_token in Redis
    res.cookies.set("client_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string }; status?: number };
    };
    const message = axiosError.response?.data?.message || "Đăng nhập thất bại";
    const status = axiosError.response?.status || 500;

    return NextResponse.json({ success: false, message }, { status });
  }
}
