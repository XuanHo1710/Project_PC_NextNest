import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL + "/admin" ||
    "http://localhost:8080/api/v1/admin";
const ACCESS_TOKEN_MAX_AGE = parseInt(
    process.env.ACCESS_TOKEN_MAX_AGE || "86400",
);

/**
 * POST /api/admin/auth/profile
 * Lấy thông tin profile admin
 * - Nếu có access_token hợp lệ → gọi backend /auth/profile
 * - Nếu không có access_token hoặc expired → gọi refresh token
 * - Nếu refresh thất bại → trả 401 để redirect về login
 */
export async function POST(request: NextRequest) {
    const cookieHeader = request.headers.get("cookie");
    const accessToken = request.cookies.get('admin_access_token')?.value;
    const sessionId = request.cookies.get('admin_sessionId')?.value;

    // Nếu không có cả access token và session ID → chưa đăng nhập
    if (!accessToken && !sessionId) {
        console.log('[Profile] No credentials found');
        return NextResponse.json(
            { success: false, message: "Chưa đăng nhập" },
            { status: 401 }
        );
    }

    // Hàm helper để gọi refresh token
    const tryRefreshToken = async () => {
        const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
                headers: {
                    Cookie: cookieHeader ?? "",
                },
                withCredentials: true,
            },
        );

        const refreshData = refreshResponse.data?.data || refreshResponse.data;

        if (!refreshData?.access_token) {
            throw new Error("Refresh token failed - no access token returned");
        }

        return refreshData;
    };

    try {
        // Trường hợp 1: Có access token → thử gọi profile
        if (accessToken) {
            try {
                console.log('[Profile] Calling backend profile with accessToken');
                const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const profileData = profileResponse.data?.data || profileResponse.data;

                console.log(profileData)
                return NextResponse.json({
                    success: true,
                    data: {
                        access_token: accessToken,
                        user: {
                            _id: profileData._id,
                            username: profileData.username,
                            IDEmp: profileData.IDEmp,
                            roleId: profileData.roleId,
                            employeeId: profileData.employeeId,
                            avatar: profileData.avatar || '',
                            role: profileData.role,
                        },
                    }
                });
            } catch (profileError: any) {
                if (profileError?.response?.status === 401 && sessionId) {
                    // Token expired, try refresh
                    try {
                        const refreshData = await tryRefreshToken();

                        const res = NextResponse.json({
                            success: true,
                            data: {
                                access_token: refreshData.access_token,
                                user: {
                                    _id: refreshData.payload._id,
                                    username: refreshData.payload.username,
                                    IDEmp: refreshData.payload.IDEmp,
                                    roleId: refreshData.payload.roleId,
                                    employeeId: refreshData.payload.employeeId,
                                    avatar: refreshData.payload.avatar || '',
                                },
                            },
                        });

                        // Cập nhật cookie với token mới
                        res.cookies.set("admin_access_token", refreshData.access_token, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "lax",
                            maxAge: ACCESS_TOKEN_MAX_AGE,
                            path: "/",
                        });

                        console.log('[Profile] Refresh success, new token set');
                        return res;
                    } catch (refreshError: any) {
                        console.error('[Profile] Refresh failed:', refreshError?.response?.status, refreshError?.response?.data);
                        // Refresh failed → clear cookies và trả 401
                        const response = NextResponse.json(
                            { success: false, message: "Phiên đăng nhập hết hạn" },
                            { status: 401 },
                        );
                        response.cookies.delete("admin_access_token");
                        response.cookies.delete("admin_sessionId");
                        return response;
                    }
                }

                // Các lỗi khác → clear và trả 401
                console.log('[Profile] Other error, clearing auth');
                throw profileError;
            }
        }

        // Trường hợp 2: Không có access token nhưng có session → try refresh
        if (sessionId) {
            console.log('[Profile] No accessToken but have sessionId, trying refresh');
            try {
                const refreshData = await tryRefreshToken();

                const res = NextResponse.json({
                    success: true,
                    data: {
                        access_token: refreshData.access_token,
                        user: {
                            _id: refreshData.payload._id,
                            username: refreshData.payload.username,
                            IDEmp: refreshData.payload.IDEmp,
                            roleId: refreshData.payload.roleId,
                            employeeId: refreshData.payload.employeeId,
                            avatar: refreshData.payload.avatar || '',
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

                console.log('[Profile] Refresh success (no prior token)');
                return res;
            } catch (refreshError: any) {
                console.error('[Profile] Refresh failed (no prior token):', refreshError?.response?.status);
                const response = NextResponse.json(
                    { success: false, message: "Phiên đăng nhập hết hạn" },
                    { status: 401 },
                );
                response.cookies.delete("admin_access_token");
                response.cookies.delete("admin_sessionId");
                return response;
            }
        }

        // Không có cách nào để xác thực
        return NextResponse.json(
            { success: false, message: "Chưa đăng nhập" },
            { status: 401 }
        );

    } catch (error: any) {
        console.error('[Profile] Final error:', error?.response?.status, error?.message);

        // Clear cookies on error
        const response = NextResponse.json(
            { success: false, message: "Lỗi xác thực" },
            { status: 401 }
        );
        response.cookies.delete('admin_access_token');
        response.cookies.delete('admin_sessionId');
        return response;
    }
}
