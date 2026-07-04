import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Check Your Email | Ticketing System",
    description: "Please verify your email address",
};

export default function CheckEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="size-8 text-primary" />
                </div>

                <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                    Check your email
                </h1>

                <p className="mb-6 text-sm text-muted-foreground">
                    We&apos;ve sent a confirmation link to your email address. Please
                    click the link to verify your account.
                </p>

                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/welcome">Back to Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
