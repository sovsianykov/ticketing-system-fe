"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ticketsApi } from "@/lib/tickets";
import { TICKET_TYPES, type TicketType, type TicketState, type Epic } from "@/types/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/tickets/TiptapEditor";

interface TicketFormProps {
  teamId: string;
  onSuccess: () => void;
}

export function TicketForm({ teamId, onSuccess }: TicketFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<TicketType>("feature");
  const [state, setState] = useState<TicketState>("new");
  const [epicId, setEpicId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: epics = [] } = useQuery({
    queryKey: ["epics"],
    queryFn: ticketsApi.getEpics,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await ticketsApi.createTicket({
        title,
        body,
        type,
        state,
        epicId: epicId || null,
        teamId: teamId,
      });
      setTitle("");
      setBody("");
      setType("feature");
      setState("new");
      setEpicId(null);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <div className='mr-[15%]'>
        <Button>
          <Plus className="mr-2 h-4 w-4 " />
          New Ticket
        </Button>
      </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Create a new ticket for the selected team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ticket title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <TiptapEditor
                value={body}
                onChange={setBody}
                placeholder="Describe the ticket..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: TicketType) => setType(value)}>
                <SelectTrigger id="type">
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
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={(value: TicketState) => setState(value)}>
                <SelectTrigger id="state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="ready_for_implementation">Ready for Implementation</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="ready_for_acceptance">Ready for Acceptance</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="epic">Epic (Optional)</Label>
              <Select value={epicId || ""} onValueChange={(value) => setEpicId(value || null)}>
                <SelectTrigger id="epic">
                  <SelectValue placeholder="Select an epic" />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
