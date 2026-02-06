import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);

/**
 * POST /api/admin/auth/refresh
 * Reads admin_refresh_token from cookies, calls backend to get new access_token,
 * updates the admin_access_token cookie, and returns the new token in the body.
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("admin_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token không tồn tại" },
        { status: 401 },
      );
    }

    // Call backend refresh endpoint with the refresh_token cookie forwarded
    const response = await axios.post(
      `${API_URL}/admin/auth/refresh`,
      {},
      {
        headers: {
          Cookie: `admin_refresh_token=${refreshToken}`,
        },
      },
    );

    const data = response.data?.data || response.data;

    if (!data?.access_token) {
      return NextResponse.json(
        { success: false, message: "Không thể tạo access token mới" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      success: true,
      data: {
        access_token: data.access_token,
      },
    });

    // Update admin_access_token cookie with the new token
    res.cookies.set("admin_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("Admin refresh token error:", error);

    // Clear cookies if refresh fails
    const response = NextResponse.json(
      { success: false, message: "Phiên đăng nhập hết hạn" },
      { status: 401 },
    );
    response.cookies.delete("admin_access_token");
    response.cookies.delete("admin_refresh_token");

    return response;
  }
}
