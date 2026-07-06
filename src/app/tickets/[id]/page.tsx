"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ticketsApi } from "@/lib/tickets";
import { SafeHtml } from "@/components/tickets/SafeHtml";
import { TicketStateBadge, TicketTypeBadge } from "@/components/tickets/TicketStateBadge";
import { TicketComments } from "@/components/tickets/TicketComments";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Calendar } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketsApi.getTicket(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-6" />
        <div className="h-8 bg-muted rounded w-2/3 mb-4" />
        <div className="flex gap-2 mb-6">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-24" />
        </div>
        <div className="h-32 bg-muted rounded mb-4" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground text-lg">Ticket not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/tickets")}>
          Back to tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tickets
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/tickets/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <TicketTypeBadge type={ticket.type} />
        <TicketStateBadge state={ticket.state} />
      </div>

      <h1 className="text-2xl font-bold mt-3 mb-4">{ticket.title}</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(ticket.createdAt)}
        </span>
      </div>

      {ticket.body ? (
        <div className="rounded-lg border p-4 bg-card mb-2">
          <SafeHtml html={ticket.body} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic mb-2">No description provided.</p>
      )}

      <div className="border-t mt-8 pt-2">
        <TicketComments ticketId={id} />
      </div>
    </div>
  );
}
