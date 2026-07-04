import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { callBackendRefresh } from "@/lib/auth-server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/token";

export async function POST() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    console.log('Refresh token from cookie:', refreshToken);

    if (!refreshToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await callBackendRefresh(refreshToken);

    console.log('Backend refresh result:', result);

    if (!result.ok) {
        return NextResponse.json(
            { message: result.message },
            { status: result.status }
        );
    }

    // Backend returns new accessToken and sets new refreshToken in HttpOnly Cookie
    const payload = {
        accessToken: result.data.access_token,
        user: result.data.user,
    };

    const response = NextResponse.json(payload);

    // Forward the Set-Cookie header from backend response
    if (result.setCookie) {
        // Fix the Path to / so cookie is sent to all routes
        const fixedCookie = result.setCookie.replace(/Path=\/api\/v1\/auth/, 'Path=/');
        response.headers.set("set-cookie", fixedCookie);
    }

    return response;
}
