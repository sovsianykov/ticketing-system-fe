import { api } from "./api";
import type { Ticket, CreateTicketDto, UpdateTicketDto, Team, Epic } from "@/types/tickets";

export const ticketsApi = {
  // Get all tickets for a team
  getTickets: async (teamId: string): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>(`/tickets?team_id=${teamId}`);
    return response.data;
  },

  // Get a single ticket by ID
  getTicket: async (ticketId: string): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/tickets/${ticketId}`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (data: CreateTicketDto): Promise<Ticket> => {
    const response = await api.post<Ticket>("/tickets", data);
    return response.data;
  },

  // Update a ticket
  updateTicket: async (ticketId: string, data: UpdateTicketDto): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${ticketId}`, data);
    return response.data;
  },

  // Update ticket state (for drag-and-drop)
  updateTicketState: async (ticketId: string, state: string): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${ticketId}`, { state });
    return response.data;
  },

  // Delete a ticket
  deleteTicket: async (ticketId: string): Promise<void> => {
    await api.delete(`/tickets/${ticketId}`);
  },

  // Get all teams
  getTeams: async (): Promise<Team[]> => {
    const response = await api.get<Team[]>("/teams");
    return response.data;
  },

  // Create a new team
  createTeam: async (name: string): Promise<Team> => {
    const response = await api.post<Team>("/teams", { name });
    return response.data;
  },

  // Get all epics
  getEpics: async (): Promise<Epic[]> => {
    const response = await api.get<Epic[]>("/epics");
    return response.data;
  },
};
