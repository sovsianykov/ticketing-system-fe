"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Ticket, TicketState } from "@/types/tickets";
import { TicketCard } from "./TicketCard";

interface KanbanColumnProps {
  state: TicketState;
  title: string;
  tickets: Ticket[];
}

export function KanbanColumn({ state, title, tickets }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: state,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-xl border bg-card p-4 transition-colors ${
        isOver ? "border-primary bg-accent" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tickets
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
