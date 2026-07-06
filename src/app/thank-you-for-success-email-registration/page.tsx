import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Email Verified | Ticketing System",
    description: "Your email has been successfully verified",
};

export default function ThankYouPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="size-8 text-primary" />
                </div>

                <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                    Thank you!
                </h1>

                <p className="mb-1 text-sm text-muted-foreground">
                    Your email has been successfully verified.
                </p>

                <p className="mb-6 text-sm text-muted-foreground">
                    You can now sign in to your account.
                </p>

                <Button asChild className="w-full">
                    <Link href="/welcome">Go to Sign In</Link>
                </Button>
            </div>
        </div>
    );
}
