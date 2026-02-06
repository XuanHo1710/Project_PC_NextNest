import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL + "/admin" ||
  "http://localhost:8080/api/v1/admin";

/**
 * POST /api/admin/auth/logout
 * Calls backend logout API and clears all auth cookies
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("admin_access_token")?.value;

    // Try to call backend logout API
    if (accessToken) {
      try {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      } catch {
        console.log("Backend logout failed, continuing to clear cookies");
      }
    }

    // Clear all auth cookies
    const response = NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });
    response.cookies.delete("admin_access_token");
    response.cookies.delete("admin_sessionId");
    return response;
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear cookies even if there's an error
    const response = NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });
    response.cookies.delete("admin_access_token");
    response.cookies.delete("admin_sessionId");
    return response;
  }
}
