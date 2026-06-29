import type { Metadata } from "next";

import { WelcomeAuthPanel } from "@/components/auth/WelcomeAuthPanel";

export const metadata: Metadata = {
    title: "Welcome | Ticketing System",
    description: "Sign in or create an account",
};

export default function WelcomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
                <div className="mb-6 space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight text-primary">
                        Welcome
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Войдите в аккаунт или создайте новый, чтобы продолжить
                        работу с тикетами.
                    </p>
                </div>

                <WelcomeAuthPanel />
            </div>
        </div>
    );
}
