import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('refresh_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = { token: token };

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/account-employee/token-account`, payload, {
        withCredentials: true
    });

    if (!response.data) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(response.data, { status: 200 });
}


export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value || "";
    const refreshToken = request.cookies.get('refresh_token')?.value || "";


    if (!accessToken && !refreshToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
}