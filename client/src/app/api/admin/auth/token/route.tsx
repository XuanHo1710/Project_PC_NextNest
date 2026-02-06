import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const adminAccessToken = request.cookies.get('admin_access_token')?.value;

    if (!adminAccessToken) {
        return NextResponse.json({ message: 'Hết hạn phiên đăng nhập', data: null }, { status: 401 });
    }

    try {
        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/account-employee/token-account`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${adminAccessToken}`,
                },
            }
        );

        // Include access_token so admin AuthProvider can store it in Zustand
        const responseData = res.data?.data || res.data;
        return NextResponse.json({
            ...res.data,
            data: {
                ...responseData,
                access_token: adminAccessToken,
            },
        }, { status: 200 });
    } catch {
        // Token invalid/expired — delete the cookies
        const response = NextResponse.json({ message: 'Unauthorized', data: null }, { status: 401 });
        response.cookies.delete('admin_access_token');
        return response;
    }
}

export async function DELETE(request: NextRequest) {
    const adminAccessToken = request.cookies.get('admin_access_token')?.value;
    const { id } = await request.json();

    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${adminAccessToken}`,
                },
            }
        );
    } catch (error) {
        console.log('Backend admin logout failed:', error);
    }

    // Clear all admin cookies on logout
    const response = NextResponse.json({ status: 200 });
    response.cookies.delete('admin_access_token');
    response.cookies.delete('admin_refresh_token');
    return response;
}
