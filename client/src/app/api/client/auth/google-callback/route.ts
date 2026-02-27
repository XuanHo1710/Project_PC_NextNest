import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = parseInt(
  process.env.ACCESS_TOKEN_MAX_AGE || "3600",
);

/**
 * POST /api/client/auth/google-callback
 * Called by the client after receiving GOOGLE_LOGIN_SUCCESS postMessage from the popup.
 * Sets httpOnly cookies (client_access_token, client_sessionId) and returns user info.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, payload } = body;

    if (!access_token || !payload?._id) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu không hợp lệ" },
        { status: 400 },
      );
    }

    const res = NextResponse.json({
      success: true,
      data: {
        access_token,
        user: {
          _id: payload._id,
          email: payload.email,
          fullname: payload.fullname,
          avatar: payload.avatar,
          authProvider: payload.authProvider,
          accountStatus: payload.accountStatus,
          isEmailVerified: payload.isEmailVerified,
          phone: payload.phone,
          gender: payload.gender,
        },
      },
    });

    res.cookies.set("client_access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    res.cookies.set("client_sessionId", payload._id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 31536000, // 1 year
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi xử lý đăng nhập Google" },
      { status: 500 },
    );
  }
}
