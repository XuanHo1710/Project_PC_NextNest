import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const refresh_token = request.cookies.get('client_refresh_token')?.value;

    if (!refresh_token) {
        return NextResponse.json({ message: 'Hết hạn phiên đăng nhập' }, { status: 401 });
    }

    const payload = { token: refresh_token };

    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/account-guest/token-account`, payload, {
        headers: {
            Authorization: `Bearer ${refresh_token}`,
        }
    });

    return NextResponse.json(res.data, { status: 200 });
}