"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "@/lib/tickets";
import type { TicketComment } from "@/types/tickets";
import { TiptapEditor } from "./TiptapEditor";
import { SafeHtml } from "./SafeHtml";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface TicketCommentsProps {
  ticketId: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketComments({ ticketId }: TicketCommentsProps) {
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", ticketId],
    queryFn: () => ticketsApi.getComments(ticketId),
  });

  const mutation = useMutation({
    mutationFn: (html: string) => ticketsApi.createComment({ ticketId, body: html }),
    onMutate: async (html) => {
      await queryClient.cancelQueries({ queryKey: ["comments", ticketId] });
      const prev = queryClient.getQueryData<TicketComment[]>(["comments", ticketId]);
      const optimistic: TicketComment = {
        id: `optimistic-${Date.now()}`,
        ticketId,
        authorId: "me",
        body: html,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<TicketComment[]>(["comments", ticketId], (old = []) => [
        ...old,
        optimistic,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["comments", ticketId], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", ticketId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.replace(/<[^>]+>/g, "").trim();
    if (!text) return;
    mutation.mutate(body);
    setBody("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {isLoading && (
        <div className="space-y-3 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-3 bg-muted rounded w-1/4 mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="space-y-3 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border p-4 bg-card">
              <div className="text-xs text-muted-foreground mb-2">
                {formatDate(comment.createdAt)}
              </div>
              <SafeHtml html={comment.body} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground mb-6">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <TiptapEditor
          value={body}
          onChange={setBody}
          placeholder="Write a comment..."
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending} size="sm">
            {mutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
