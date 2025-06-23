import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/decode/access`, {
            // withCredentials: true,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Cookie: `token=${accessToken}`
            }
        });

        if (!response.data) {
            return NextResponse.json({ message: 'Token is not valid' }, { status: 401 });
        }
        return NextResponse.json(response.data, { status: 200 });
    } catch {
        return NextResponse.json({ message: 'Token is not valid' }, { status: 401 });
    }
}