import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const access_token = request.cookies.get('access_token')?.value;
    const refresh_token = request.cookies.get('refresh_token')?.value;

    if (!refresh_token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = { token: refresh_token };

    // const resDecodeAccess = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/decode/access`, {
    //     // withCredentials: true,
    //     headers: {
    //         Authorization: `Bearer ${access_token}`,
    //         Cookie: `token=${access_token}`
    //     }
    // });

    // const resDecodeRefresh = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/decode/refresh`, {
    //     // withCredentials: true,
    //     headers: {
    //         Authorization: `Bearer ${access_token}`,
    //         Cookie: `token=${refresh_token}`
    //     }
    // });

    // response.cookies.set({
    //     name: "refresh_token",
    //     value: refresh_token,
    //     httpOnly: true,
    //     maxAge: resDecodeRefresh.data.exp
    // })

    // response.cookies.set({
    //     name: "access_token",
    //     value: access_token,
    //     httpOnly: true,
    //     maxAge: resDecodeAccess.data.exp
    // })

    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/account-employee/token-account`, payload, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        }
    });


    if (!res.data) {
        const resDirect = NextResponse.redirect(new URL("/auth/login", request.url));
        resDirect.cookies.delete("access_token")
        resDirect.cookies.delete("refresh_token")
        return resDirect;
    }

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