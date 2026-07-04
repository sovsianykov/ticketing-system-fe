import { NextResponse } from "next/server";

import { mapAuthResponse } from "@/lib/auth-server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

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

    // Call backend
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: body.email,
            password: body.password,
        }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const message = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message ?? "Authentication failed";

        return NextResponse.json({ message }, { status: res.status });
    }

    // Backend sets HttpOnly Cookie with refreshToken
    // Forward Set-Cookie header from backend response to client
    const response = NextResponse.json(mapAuthResponse(data));

    const setCookieHeader = res.headers.get("set-cookie");

    if (setCookieHeader) {
        // Fix the Path to / so cookie is sent to all routes
        const fixedCookie = setCookieHeader.replace(/Path=\/api\/v1\/auth/, 'Path=/');
        response.headers.set("set-cookie", fixedCookie);
    }

    return response;
}
