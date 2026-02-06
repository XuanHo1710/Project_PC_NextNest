import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/admin" ||
  "http://localhost:8080/api/v1/admin";
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);

/**
 * POST /api/admin/auth/login
 * Receives credentials from admin, calls backend, stores tokens in httpOnly cookies
 * - admin_access_token: for authenticating API requests
 * - admin_refresh_token: Backend Store it in Redis DB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { IDEmp, password } = body;

    if (!IDEmp || !password) {
      return NextResponse.json(
        { success: false, message: "IDEmp và mật khẩu là bắt buộc" },
        { status: 400 },
      );
    }

    const response = await axios.post(`${API_URL}/auth/login`, {
      IDEmp,
      password,
    });

    console.log(response.data.data.payload)

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
          username: data.payload?.username,
          IDEmp: data.payload?.IDEmp,
          roleId: data.payload?.roleId,
          employeeId: data.payload?.employeeId,
        },
      },
    });

    res.cookies.set("admin_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    // Set sessionId cookie for user identification
    res.cookies.set("admin_sessionId", data.payload?._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 31536000, // 1 year
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
