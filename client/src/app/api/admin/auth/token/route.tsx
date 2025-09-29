import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const refresh_token = request.cookies.get('refresh_token')?.value;

    if (!refresh_token) {
        return NextResponse.json({ message: 'Hết hạn phiên đăng nhập' }, { status: 401 });
    }

    const payload = { token: refresh_token };

    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/account-employee/token-account`, payload, {
        headers: {
            Authorization: `Bearer ${refresh_token}`,
        }
    });

    return NextResponse.json(res.data, { status: 200 });
}


export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value || "";
    const refreshToken = request.cookies.get('refresh_token')?.value || "";


    if (!accessToken && !refreshToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
    const { id } = await request.json();
    // const res = NextResponse.redirect(new URL("/auth/login", request.url));
    // res.cookies.delete("access_token")
    // res.cookies.delete("refresh_token")

    try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/logout`, { id: id });
    } catch (error) {
        console.log(error);
    }

    return NextResponse.json({ status: 200 });
}