import { NextResponse } from "next/server";

import { callBackendRegister } from "@/lib/auth-server";

export async function POST(request: Request) {
    const body = (await request.json()) as {
        email?: string;
        password?: string;
        name?: string;
    };

    if (!body.email || !body.password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    const result = await callBackendRegister({
        email: body.email,
        password: body.password,
        name: body.name,
    });

    if (!result.ok) {
        const message = Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message;

        return NextResponse.json({ message }, { status: result.status });
    }

    // Backend returns only { message: string } for registration
    // No tokens are returned - user must verify email first
    return NextResponse.json({ message: result.data.message });
}
