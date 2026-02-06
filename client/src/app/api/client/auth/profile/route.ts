import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/client" ||
  "http://localhost:8080/api/v1/client";

const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);

/**
 * POST /api/client/auth/profile
 * Reads client_access_token from cookies, calls backend profile API.
 * Returns user data + access_token so the client can store it in Zustand for axiosClient.
 */
export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");

  try {
    // Auto call refresh token endpoint if access token is expired
    let accessToken = request.cookies.get("client_access_token")?.value;

    if (!accessToken) {
      try {
        const refreshTokenResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Cookie: cookieHeader ?? "",
            },
            withCredentials: true,
          },
        );

        const refreshData =
          refreshTokenResponse.data?.data || refreshTokenResponse.data;
        const res = NextResponse.json({
          success: true,
          data: {
            access_token: refreshData.access_token,
            user: {
              _id: refreshData._id,
              email: refreshData.email,
              fullname: refreshData.fullname,
              avatar: refreshData.avatar,
              authProvider: refreshData.authProvider,
              accountStatus: refreshData.accountStatus,
              isEmailVerified: refreshData.isEmailVerified,
              phone: refreshData.phone,
              gender: refreshData.gender,
            },
          },
        });

        res.cookies.set("client_access_token", refreshData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ACCESS_TOKEN_MAX_AGE,
          path: "/",
        });

        return res;
      } catch {
        return NextResponse.json(
          { success: false, message: "Lỗi khi lấy thông tin tài khoản" },
          { status: 400 },
        );
      }
    }

    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = profileResponse.data?.data || profileResponse.data;

    return NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        user: {
          _id: profileData._id,
          email: profileData.email,
          fullname: profileData.fullname,
          avatar: profileData.avatar,
          authProvider: profileData.authProvider,
          accountStatus: profileData.accountStatus,
          isEmailVerified: profileData.isEmailVerified,
          phone: profileData.phone,
          gender: profileData.gender,
        },
      },
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } };
    console.error("Profile fetch error:", error);

    if (axiosError.response?.status === 401) {
      const response = NextResponse.json(
        { success: false, message: "Phiên đăng nhập hết hạn" },
        { status: 401 },
      );
      response.cookies.delete("client_access_token");
      return response;
    }

    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy thông tin tài khoản" },
      { status: 500 },
    );
  }
}
