import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * POST /api/client/auth/profile
 * Reads client_access_token from cookies, calls backend profile API
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("client_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 },
      );
    }

    const profileResponse = await axios.get(
      `${API_URL}/client/account-guest/profile`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const profileData = profileResponse.data?.data || profileResponse.data;

    return NextResponse.json({
      success: true,
      data: {
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
