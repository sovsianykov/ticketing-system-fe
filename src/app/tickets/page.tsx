"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ticketsApi } from "@/lib/tickets";
import { useAuthStore } from "../../../store/auth.store";
import {
  COLUMN_CONFIG,
  TICKET_TYPES,
  type TicketState,
  type TicketType,
} from "@/types/tickets";
import { TicketStateBadge, TicketTypeBadge } from "@/components/tickets/TicketStateBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowLeft, ChevronRight } from "lucide-react";

const STATES: TicketState[] = [
  "new",
  "ready_for_implementation",
  "in_progress",
  "ready_for_acceptance",
  "done",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TicketsPage() {
  const router = useRouter();
  const [stateFilter, setStateFilter] = useState<TicketState | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TicketType | "all">("all");

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: ticketsApi.getTeams,
  });

  // Fetch tickets for all teams
  const teamIds = teams.map((t) => t.id);

  const ticketQueries = useQuery({
    queryKey: ["all-tickets", teamIds],
    queryFn: async () => {
      if (!teamIds.length) return [];
      const results = await Promise.all(teamIds.map((id) => ticketsApi.getTickets(id)));
      return results.flat();
    },
    enabled: teamIds.length > 0,
  });

  const tickets = ticketQueries.data ?? [];
  const isLoading = ticketQueries.isLoading || (teams.length === 0 && ticketQueries.isFetching);

  const filtered = tickets.filter((t) => {
    if (stateFilter !== "all" && t.state !== stateFilter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Tickets</h1>
        </div>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as TicketState | "all")}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {COLUMN_CONFIG[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TicketType | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TICKET_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-3 bg-muted rounded w-12" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No tickets found</p>
          <p className="text-sm mt-1">
            {tickets.length > 0
              ? "Try changing the filters"
              : "Create your first ticket to get started"}
          </p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="rounded-lg border divide-y overflow-hidden">
          {filtered
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TicketTypeBadge type={ticket.type} />
                    <TicketStateBadge state={ticket.state} />
                  </div>
                  <p className="font-medium truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-4 group-hover:text-foreground transition-colors" />
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
