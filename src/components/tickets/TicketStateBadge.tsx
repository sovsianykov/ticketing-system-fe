import { cn } from "@/lib/utils";
import type { TicketState, TicketType } from "@/types/tickets";
import { COLUMN_CONFIG } from "@/types/tickets";

const STATE_COLORS: Record<TicketState, string> = {
  new: "bg-slate-100 text-slate-700",
  ready_for_implementation: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  ready_for_acceptance: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const TYPE_COLORS: Record<TicketType, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-blue-100 text-blue-700",
  fix: "bg-green-100 text-green-700",
};

export function TicketStateBadge({ state }: { state: TicketState }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", STATE_COLORS[state])}>
      {COLUMN_CONFIG[state]}
    </span>
  );
}

export function TicketTypeBadge({ type }: { type: TicketType }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", TYPE_COLORS[type])}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}
