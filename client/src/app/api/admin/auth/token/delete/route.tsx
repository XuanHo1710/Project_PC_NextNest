import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
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