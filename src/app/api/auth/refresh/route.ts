import { NextResponse } from "next/server";

import {
    callBackendRefresh,
    clearRefreshTokenCookie,
    getRefreshTokenFromCookies,
    setRefreshTokenCookie,
} from "@/lib/auth-server";

export async function POST() {
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await callBackendRefresh(refreshToken);

    if (!result.ok) {
        const response = NextResponse.json(
            { message: result.message },
            { status: result.status }
        );
        clearRefreshTokenCookie(response);
        return response;
    }

    const payload = {
        accessToken: result.data.access_token,
        user: result.data.user,
    };

    const response = NextResponse.json(payload);

    if (result.data.refresh_token) {
        setRefreshTokenCookie(response, result.data.refresh_token);
    }

    return response;
}
