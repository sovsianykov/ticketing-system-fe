# Ticketing System — Frontend

A Next.js ticket management app with a Kanban board, team management, and email-based authentication.

## Tech Stack

- **Framework:** Next.js (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix UI)
- **State:** Zustand (auth) + TanStack Query v5 (server state)
- **Forms:** react-hook-form + zod v4
- **Drag & Drop:** @dnd-kit
- **HTTP:** Axios with auto token-refresh interceptor

## Getting Started

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `http://localhost:8080/api/v1`).

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint check
```

## Project Structure

```
src/
  app/           # App Router pages (welcome, dashboard, tickets, confirm-email, verify-email)
  components/    # Feature components (KanbanBoard, LoginForm, TeamForm, TicketForm) + ui/
  lib/           # Utilities: api.ts, auth.ts, tickets.ts, token.ts
  types/         # Shared TypeScript types
store/
  auth.store.ts  # Zustand auth store (accessToken, user, setSession, logout)
```

## Auth Flow

1. User registers/logs in → receives access token (Zustand) + refresh token (httpOnly cookie)
2. Email confirmation required before dashboard access
3. On 401, the Axios interceptor auto-refreshes via `/api/auth/refresh` before retrying
4. On refresh failure, redirects to `/welcome`
