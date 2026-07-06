"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ticketsApi } from "@/lib/tickets";
import { TICKET_TYPES, COLUMN_CONFIG, type TicketType, type TicketState, type Epic } from "@/types/tickets";
import { TiptapEditor } from "@/components/tickets/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const STATES: TicketState[] = [
  "new",
  "ready_for_implementation",
  "in_progress",
  "ready_for_acceptance",
  "done",
];

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<TicketType>("feature");
  const [state, setState] = useState<TicketState>("new");
  const [teamId, setTeamId] = useState("");
  const [epicId, setEpicId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: ticketsApi.getTeams,
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["epics"],
    queryFn: ticketsApi.getEpics,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!teamId) {
      setError("Please select a team.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const ticket = await ticketsApi.createTicket({
        title: title.trim(),
        body,
        type,
        state,
        epicId: epicId || null,
        teamId: teamId,
      });
      router.push(`/tickets/${ticket.id}`);
    } catch {
      setError("Failed to create ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Tickets
        </Button>
        <h1 className="text-2xl font-bold">New Ticket</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter ticket title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <TiptapEditor
            value={body}
            onChange={setBody}
            placeholder="Describe the ticket..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>State *</Label>
            <Select value={state} onValueChange={(v) => setState(v as TicketState)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {COLUMN_CONFIG[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Team *</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Epic (optional)</Label>
            <Select value={epicId} onValueChange={setEpicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select epic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {epics.map((epic: Epic) => (
                  <SelectItem key={epic.id} value={epic.id}>
                    {epic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push("/tickets")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
