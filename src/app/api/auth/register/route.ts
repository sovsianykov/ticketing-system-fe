import { NextResponse } from "next/server";

import {
    callBackendAuth,
    mapAuthResponse,
    setRefreshTokenCookie,
} from "@/lib/auth-server";

export async function POST(request: Request) {
    const body = (await request.json()) as {
        email?: string;
        password?: string;
    };

    if (!body.email || !body.password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    const result = await callBackendAuth("/auth/register", {
        email: body.email,
        password: body.password,
    });

    if (!result.ok) {
        const message = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message;

        return NextResponse.json({ message }, { status: result.status });
    }

    if (!result.data.refresh_token) {
        return NextResponse.json(
            { message: "Refresh token missing from backend response" },
            { status: 500 }
        );
    }

    const response = NextResponse.json(mapAuthResponse(result.data));
    setRefreshTokenCookie(response, result.data.refresh_token);

    return response;
}
