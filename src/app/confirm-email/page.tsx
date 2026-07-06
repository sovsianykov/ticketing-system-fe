"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../../store/auth.store";
import type { AuthResponse } from "@/types/auth";

export default function ConfirmEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setSession = useAuthStore((s) => s.setSession);
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">(
        token ? "loading" : "error"
    );
    const [error, setError] = useState<string | null>(
        token ? null : "Invalid verification link"
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        let isMounted = true;

        const verifyEmail = async () => {
            try {
                const res = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json() as AuthResponse;

                if (!res.ok) {
                    throw new Error((data as unknown as { message: string }).message || "Verification failed");
                }

                if (isMounted) {
                    setSession(data.accessToken, data.user);
                    setStatus("success");
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to verify email"
                    );
                    setStatus("error");
                }
            }
        };

        verifyEmail();

        return () => {
            isMounted = false;
        };
    }, [token, router, setSession]);

    const handleGoToDashboard = () => {
        router.push("/dashboard");
        router.refresh();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
                {status === "loading" && (
                    <>
                        <div className="mx-auto mb-6 size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                            Verifying your email...
                        </h1>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="size-8 text-green-600" />
                        </div>
                        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                            Email is confirmed
                        </h1>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Your email has been verified successfully. You can now
                            access your dashboard.
                        </p>
                        <Button onClick={handleGoToDashboard} className="w-full">
                            OK
                        </Button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100">
                            <svg
                                className="size-8 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                            Verification Failed
                        </h1>
                        <p className="mb-6 text-sm text-muted-foreground">
                            {error || "Something went wrong"}
                        </p>
                        <Button
                            onClick={() => router.push("/welcome")}
                            className="w-full"
                        >
                            Back to Login
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
