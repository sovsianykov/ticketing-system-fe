"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useAuthStore } from "../../../store/auth.store";

export default function DashboardPage() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const logoutStore = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        await logout(accessToken);
        logoutStore();
        router.push("/welcome");
        router.refresh();
    };

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {user?.email
                            ? `Signed in as ${user.email}`
                            : "Welcome to the ticketing system"}
                    </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Sign Out
                </Button>
            </div>

            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                Kanban board and other sections will be added in the next
                stages.
            </div>
        </div>
    );
}
