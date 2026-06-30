export type TicketType = "bug" | "feature" | "fix";

export type TicketState = 
  | "new" 
  | "ready_for_implementation" 
  | "in_progress" 
  | "ready_for_acceptance" 
  | "done";

export type Epic = {
  id: string;
  title: string;
};

export type Team = {
  id: string;
  name: string;
};

export type Ticket = {
  id: string;
  title: string;
  type: TicketType;
  state: TicketState;
  epic: Epic | null;
  team: Team;
  modified_at: string;
  created_at: string;
};

export type CreateTicketDto = {
  title: string;
  type: TicketType;
  state: TicketState;
  epic_id?: string | null;
  team_id: string;
};

export type UpdateTicketDto = {
  title?: string;
  type?: TicketType;
  state?: TicketState;
  epic_id?: string | null;
  team_id?: string;
};

export const COLUMN_CONFIG: Record<TicketState, string> = {
  new: "New",
  ready_for_implementation: "Ready for Implementation",
  in_progress: "In Progress",
  ready_for_acceptance: "Ready for Acceptance",
  done: "Done",
};

export const TICKET_TYPES: TicketType[] = ["bug", "feature", "fix"];
