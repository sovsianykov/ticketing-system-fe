"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Search, Filter } from "lucide-react";

import { ticketsApi } from "@/lib/tickets";
import { COLUMN_CONFIG, TICKET_TYPES, type Ticket, type TicketState, type TicketType } from "@/types/tickets";
import { KanbanColumn } from "./KanbanColumn";
import { TicketCard } from "./TicketCard";
import { TeamForm } from "@/components/TeamForm/TeamForm";
import { TicketForm } from "@/components/TicketForm/TicketForm";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function KanbanBoard() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TicketType | "all">("all");
  const [filterEpic, setFilterEpic] = useState<string>("all");
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: ticketsApi.getTeams,
  });

  // Fetch epics
  const { data: epics = [] } = useQuery({
    queryKey: ["epics"],
    queryFn: ticketsApi.getEpics,
  });

  // Fetch tickets for selected team
  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tickets", selectedTeam],
    queryFn: () => ticketsApi.getTickets(selectedTeam),
    enabled: !!selectedTeam,
  });

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || ticket.type === filterType;
      const matchesEpic = filterEpic === "all" || ticket.epic?.id === filterEpic;
      return matchesSearch && matchesType && matchesEpic;
    });
  }, [tickets, searchQuery, filterType, filterEpic]);

  // Group tickets by state and sort by modified_at (newest first)
  const ticketsByState = useMemo(() => {
    const grouped: Record<TicketState, Ticket[]> = {
      new: [],
      ready_for_implementation: [],
      in_progress: [],
      ready_for_acceptance: [],
      done: [],
    };

    filteredTickets.forEach((ticket) => {
      if (grouped[ticket.state]) {
        grouped[ticket.state].push(ticket);
      }
    });

    // Sort each column by modified_at (newest first)
    Object.keys(grouped).forEach((state) => {
      grouped[state as TicketState].sort((a, b) => 
        new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
      );
    });

    return grouped;
  }, [filteredTickets]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newState = over.id as TicketState;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.state === newState) return;

    try {
      await ticketsApi.updateTicketState(ticketId, newState);
      refetch();
    } catch (error) {
      console.error("Failed to update ticket state:", error);
      // The UI will revert automatically since we refetch on success
      // In a real app, you might want to show a toast notification
    }
  };

  const handleTeamCreated = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  if (!selectedTeam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select a Team</h2>
          <div className="flex items-center gap-2">
            <Select value={selectedTeam} onValueChange={setSelectedTeam} >
              <SelectTrigger>
                <SelectValue placeholder="Choose a team to view tickets" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TeamForm onSuccess={handleTeamCreated} />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Failed to load tickets. Please try again.</p>
      </div>
    );
  }

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = selectedTeamData;

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-semibold">Kanban Board</h1>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TeamForm onSuccess={handleTeamCreated} />
          </div>
          <TicketForm teamId={selectedTeam} onSuccess={() => refetch()} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(value: string) => setFilterType(value as TicketType | "all")}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TICKET_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterEpic} onValueChange={(value: string) => setFilterEpic(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Epic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Epics</SelectItem>
              {epics.map((epic) => (
                <SelectItem key={epic.id} value={epic.id}>
                  {epic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(Object.keys(COLUMN_CONFIG) as TicketState[]).map((state) => (
            <SortableContext
              key={state}
              id={state}
              items={ticketsByState[state].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                state={state}
                title={COLUMN_CONFIG[state]}
                tickets={ticketsByState[state]}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTicket ? <TicketCard ticket={activeTicket} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
