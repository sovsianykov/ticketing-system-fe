"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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

type FormState = {
  title: string;
  body: string;
  type: TicketType;
  state: TicketState;
  epicId: string;
};

export default function EditTicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketsApi.getTicket(id),
    enabled: Boolean(id),
  });

  const { data: epics = [] } = useQuery({
    queryKey: ["epics"],
    queryFn: ticketsApi.getEpics,
  });

  // Derive controlled form state from ticket data; key prop on page remounts when ticket loads
  const defaultForm = useMemo<FormState>(
    () =>
      ticket
        ? { title: ticket.title, body: ticket.body ?? "", type: ticket.type, state: ticket.state, epicId: ticket.epicId ?? "" }
        : { title: "", body: "", type: "feature", state: "new", epicId: "" },
    [ticket]
  );

  const [form, setForm] = useState<FormState>(() => defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const patch = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      await ticketsApi.updateTicket(id, {
        title: form.title.trim(),
        body: form.body,
        type: form.type,
        state: form.state,
        epicId: form.epicId || null,
      });
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      router.push(`/tickets/${id}`);
    } catch {
      setError("Failed to save changes. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/tickets")}>
          Back to tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/tickets/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Ticket</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => patch("title")(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <TiptapEditor value={form.body} onChange={patch("body")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={form.type} onValueChange={patch("type")}>
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
            <Select value={form.state} onValueChange={patch("state")}>
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

        <div className="space-y-2">
          <Label>Epic (optional)</Label>
          <Select value={form.epicId} onValueChange={patch("epicId")}>
            <SelectTrigger className="w-full">
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push(`/tickets/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
