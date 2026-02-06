import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL + "/admin" ||
    "http://localhost:8080/api/v1/admin";
const ACCESS_TOKEN_MAX_AGE = parseInt(
    process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);
/**
 * POST /api/admin/auth/token
 * Legacy endpoint - redirects to /api/admin/auth/profile
 * Kept for backward compatibility
 */
export async function POST(request: NextRequest) {
    const cookieHeader = request.headers.get("cookie");

    try {
        const accessToken = request.cookies.get('admin_access_token')?.value;

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
                            access_token: accessToken,
                            _id: refreshData._id,
                            username: refreshData.username,
                            IDEmp: refreshData.IDEmp,
                            roleId: refreshData.roleId,
                            employeeId: refreshData.employeeId,
                        },
                    },
                });

                res.cookies.set("admin_access_token", refreshData.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: ACCESS_TOKEN_MAX_AGE,
                    path: "/",
                });

                return res;
            } catch {
                const response = NextResponse.json(
                    { success: false, message: "Lỗi khi lấy thông tin tài khoản" },
                    { status: 400 },
                );
                response.cookies.delete("admin_access_token");
                response.cookies.delete("admin_sessionId")
                return response;
            }
        }

        // Call backend to get profile with access token
        const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const profileData = profileResponse.data?.data || profileResponse.data;

        return NextResponse.json({
            success: true,
            data: {
                access_token: profileData.access_token,
                user: {
                    access_token: accessToken,
                    _id: profileData._id,
                    username: profileData.username,
                    IDEmp: profileData.IDEmp,
                    roleId: profileData.roleId,
                    employeeId: profileData.employeeId,
                },
            }
        });
    } catch (error) {
        console.error('Admin token verification error:', error);

        // Clear cookie on error
        const response = NextResponse.json({ success: false, data: null }, { status: 401 });
        response.cookies.delete('admin_access_token');
        return response;
    }
}

