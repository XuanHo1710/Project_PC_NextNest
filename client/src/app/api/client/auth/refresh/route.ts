import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/client" ||
  "http://localhost:8080/api/v1/client";
const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);

/**
 * POST /api/client/auth/refresh
 * Reads client_refresh_token from cookies, calls backend to get new access_token,
 * updates the client_access_token cookie, and returns the new token in the body.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");

    // Call backend refresh endpoint with none because refresh token backend holded it
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        headers: {
          Cookie: cookieHeader ?? "",
        },
        withCredentials: true,
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
        payload: data.payload,
      },
    });

    // Update client_access_token cookie with the new token
    res.cookies.set("client_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (error: unknown) {
    console.error("Refresh token error:", error);

    // Clear cookies if refresh fails (token is invalid/expired)
    const response = NextResponse.json(
      { success: false, message: "Phiên đăng nhập hết hạn" },
      { status: 401 },
    );
    response.cookies.delete("client_access_token");

    return response;
  }
}
