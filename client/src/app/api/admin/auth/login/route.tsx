import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, payload, {
            withCredentials: true
        });
        return NextResponse.json(res.data);
    } catch (error: any) {
        return NextResponse.json(error.response.data, {
            status: error.response.data.statusCode,
        });
    }
}
