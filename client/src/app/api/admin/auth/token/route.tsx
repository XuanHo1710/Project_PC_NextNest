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

        return NextResponse.json(res.data, { status: 200 });
    } catch {
        // Token invalid/expired — delete the cookie
        const response = NextResponse.json({ message: 'Unauthorized', data: null }, { status: 401 });
        response.cookies.delete('admin_access_token');
        return response;
    }
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();

    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`, { id });
    } catch (error) {
        console.log(error);
    }

    // Clear admin cookie on logout
    const response = NextResponse.json({ status: 200 });
    response.cookies.delete('admin_access_token');
    return response;
}