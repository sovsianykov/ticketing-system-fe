"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useAuthStore } from "../../../store/auth.store";
import { KanbanBoard } from "@/components/KanbanBoard/KanbanBoard";

export default function DashboardPage() {
    const router = useRouter();
    const accessToken = useAuthStore((s) => s.accessToken);
    const logoutStore = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        await logout(accessToken);
        logoutStore();
        router.push("/welcome");
        router.refresh();
    };

    return (
        <div className="relative">
            <div className="absolute top-4 right-4 z-10">
                <Button variant="outline" onClick={handleLogout}>
                    Sign Out
                </Button>
            </div>
            <KanbanBoard />
        </div>
    );
}
