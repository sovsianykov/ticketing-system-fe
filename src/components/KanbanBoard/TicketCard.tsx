"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Ticket } from "@/types/tickets";
import { Badge } from "@/components/ui/badge";

interface TicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

export function TicketCard({ ticket, isDragging = false }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "feature":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "fix":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg border bg-card p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging || isSortableDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2 flex-1">{ticket.title}</h4>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs ${getTypeColor(ticket.type)}`}>
            {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
          </Badge>
          
          {ticket.epic && (
            <Badge variant="outline" className="text-xs">
              {ticket.epic.title}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
