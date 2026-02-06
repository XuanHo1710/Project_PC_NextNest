import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * POST /api/client/auth/token
 * Legacy endpoint - redirects to /api/client/auth/profile
 * Kept for backward compatibility
 */
export async function POST(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ success: false, data: null }, { status: 401 });
        }

        // Call backend to get profile with access token
        const profileResponse = await axios.get(`${API_URL}/client/account-guest/profile`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const profileData = profileResponse.data?.data || profileResponse.data;

        return NextResponse.json({
            success: true,
            data: {
                access_token: accessToken,
                guestId: profileData._id,
                _id: profileData._id,
                email: profileData.email,
                fullname: profileData.fullname,
                avatar: profileData.avatar,
                authProvider: profileData.authProvider,
                accountStatus: profileData.accountStatus,
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);

        // Clear cookie on error
        const response = NextResponse.json({ success: false, data: null }, { status: 401 });
        response.cookies.delete('access_token');
        return response;
    }
}