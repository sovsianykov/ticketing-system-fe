import { NextResponse } from "next/server";

import {
    callBackendLogout,
    clearRefreshTokenCookie,
    getRefreshTokenFromCookies,
} from "@/lib/auth-server";

export async function POST(request: Request) {
    const accessToken = request.headers
        .get("Authorization")
        ?.replace(/^Bearer\s+/i, "");

    if (accessToken) {
        await callBackendLogout(accessToken);
    }

    const response = NextResponse.json({ success: true });
    clearRefreshTokenCookie(response);

    const refreshToken = await getRefreshTokenFromCookies();
    if (refreshToken && !accessToken) {
        // Cookie may still exist if header was not sent; ensure it is cleared.
        clearRefreshTokenCookie(response);
    }

    return response;
}
