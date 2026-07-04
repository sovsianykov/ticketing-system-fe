import { NextResponse } from "next/server";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export async function POST(request: Request) {
    const body = (await request.json()) as {
        token?: string;
    };

    if (!body.token) {
        return NextResponse.json(
            { message: "Token is required" },
            { status: 400 }
        );
    }

    const res = await fetch(`${BACKEND_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const message =
            (data as { message?: string })?.message ?? "Verification failed";
        return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json({ message: data.message });
}
