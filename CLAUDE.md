# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint check
```

## Architecture

**Next.js 16 / React 19 App Router** with TypeScript. All source lives under `src/`.

- `src/app/` — App Router pages and layouts. Route segments: `welcome`, `dashboard`, `check-email`, `confirm-email`, `verify-email`. API routes live under `src/app/api/`.
- `src/components/` — Feature components (`KanbanBoard`, `LoginForm`, `TeamForm`, `TicketForm`) and `ui/` (shadcn primitives).
- `src/lib/` — Shared utilities: `api.ts` (axios instance with auth interceptors), `auth.ts` / `auth-server.ts` (client/server auth helpers), `tickets.ts`, `token.ts`, `utils.ts`.
- `src/types/` — Shared TypeScript types (`auth.ts`, `tickets.ts`).
- `store/auth.store.ts` — Zustand store for auth state (`accessToken`, `user`, `setSession`, `logout`). Lives at the project root, not under `src/`.

**Auth flow:** Access token stored in Zustand; refresh token handled via httpOnly cookie through `/api/auth/refresh`. On 401, `api.ts` interceptor auto-retries with a refreshed token before redirecting to `/welcome`.

**Data fetching:** TanStack Query v5 for server state; Zustand for client/auth state.

**Styling:** Tailwind CSS v4 + shadcn/ui components (Radix UI primitives). Class merging via `clsx` + `tailwind-merge` (`cn()` util in `src/lib/utils.ts`).

**Forms:** `react-hook-form` + `zod` v4 for validation.

**Drag-and-drop:** `@dnd-kit` (core + sortable) for the Kanban board.

**API base URL:** `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:8080/api/v1`.
