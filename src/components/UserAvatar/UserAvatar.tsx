"use client";

import { useAuthStore } from "../../../store/auth.store";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar() {
  const user = useAuthStore((s) => s.user);
  console.log("[UserAvatar] user:", user);
  if (!user) return null;

  const initials = getInitials(user.name);
  const fullName = user.name ?? user.email;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{fullName}</span>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold select-none">
        {initials}
      </div>
    </div>
  );
}
