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
  body: string | null;
  type: TicketType;
  state: TicketState;
  teamId: string;
  epicId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketDto = {
  title: string;
  body?: string;
  type: TicketType;
  state: TicketState;
  epicId?: string | null;
  teamId: string;
};

export type UpdateTicketDto = {
  title?: string;
  body?: string;
  type?: TicketType;
  state?: TicketState;
  epicId?: string | null;
  teamId?: string;
};

export const COLUMN_CONFIG: Record<TicketState, string> = {
  new: "New",
  ready_for_implementation: "Ready for Implementation",
  in_progress: "In Progress",
  ready_for_acceptance: "Ready for Acceptance",
  done: "Done",
};

export const TICKET_TYPES: TicketType[] = ["bug", "feature", "fix"];

export type TicketComment = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentDto = {
  ticketId: string;
  body: string;
};
