# DOCS.md

# Jira Semi-Clone Frontend Documentation

## Overview

This project is a Jira-like project management application built with **Next.js (App Router)**.

The application communicates with a REST API using JWT authentication with an **Access Token + Refresh Token** strategy.

The frontend is responsible for:

- Authentication
- Project management
- Boards
- Issues
- Comments
- User profile
- Workspace navigation
- Responsive UI

---

# Tech Stack

## Framework

- Next.js (App Router)
- React
- TypeScript

## HTTP Client

- Axios

## State Management

- Zustand

## Styling

- Tailwind CSS
- Shadcn/UI

## Forms

- React Hook Form
- Zod

## Utilities

- clsx
- class-variance-authority
- date-fns

---

# Backend

Authentication API

```
http://localhost:8080/api/v1/auth
```

Other modules should use their own API prefixes.

---

# Folder Architecture

```
app/
    login/
    register/
    dashboard/
    boards/
    issues/
    profile/

components/
    ui/
    common/
    layout/
    forms/

lib/
    api/
    auth/
    utils/

store/
    auth.store.ts
    ui.store.ts

hooks/

types/

services/

middleware.ts
```

The architecture should follow separation of concerns.

- UI components should not contain business logic.
- API logic belongs in services/lib.
- State is managed only through Zustand stores.
- Components should remain reusable whenever possible.

---

# Authentication Strategy

## Access Token

The access token is:

- short-lived
- stored only in memory
- managed through Zustand
- attached to every authorized request

The access token must **never** be stored in:

- localStorage
- sessionStorage
- cookies

---

## Refresh Token

The refresh token is:

- stored in an HttpOnly cookie
- automatically sent by the browser
- inaccessible from JavaScript
- never decoded or read on the frontend

The frontend should never attempt to manually access the refresh token.

---

# Authentication Flow

## Login

After successful authentication:

1. Backend returns an Access Token.
2. Backend sets Refresh Token as HttpOnly Cookie.
3. Frontend stores only the Access Token.
4. User becomes authenticated.

---

## Authorized Requests

Every protected request should include:

```
Authorization: Bearer <accessToken>
```

---

## Token Expiration

When the backend responds with **401 Unauthorized**:

1. Send a refresh request.
2. Receive a new Access Token.
3. Update the authentication state.
4. Retry the original request automatically.

The refresh process should be completely transparent to the user.

---

## Logout

Logout should:

- clear authentication state
- remove access token from memory
- notify backend to invalidate refresh token
- redirect user to Login page

---

# Axios Configuration

Axios should be configured as a single shared HTTP client.

Requirements:

- base URL
- JSON support
- credentials enabled
- request interceptors
- response interceptors
- automatic token injection
- automatic refresh handling
- retry failed requests once after refresh

All API communication should use this single Axios instance.

---

# State Management

Zustand is the preferred state management solution.

Authentication store should contain only authentication-related state.

Examples:

- authentication status
- current access token
- current user
- loading state

Business entities such as projects, boards, and issues should have separate stores if global state is required.

---

# Middleware

Next.js Middleware is used only for frontend route protection.

Protected routes include:

- dashboard
- boards
- profile
- settings

Middleware should redirect unauthenticated users to the Login page.

Middleware is not considered a security layer and should only improve user experience.

---

# Server Components

When using Server Components or SSR:

- Refresh Token is available through cookies.
- Access Token should be forwarded through request headers when necessary.
- Authentication logic should remain centralized.

---

# API Communication Rules

Every request should:

- use the shared Axios instance
- handle errors consistently
- avoid duplicated request logic
- return typed responses
- avoid direct fetch calls unless specifically required

---

# Error Handling

Authentication errors should be handled globally.

Possible cases include:

- invalid credentials
- expired access token
- expired refresh token
- revoked session
- network errors
- server errors

When refresh fails, the application should log out the user automatically.

---

# Best Practices

## Security

- Never store Refresh Token in JavaScript.
- Never expose authentication secrets.
- Never duplicate authentication logic.
- Always use HTTPS in production.

## Architecture

- Keep components small.
- Keep business logic outside UI.
- Keep API layer centralized.
- Reuse hooks whenever possible.
- Use TypeScript everywhere.
- Prefer composition over inheritance.

## Performance

- Lazy load heavy components.
- Minimize unnecessary renders.
- Cache server data when appropriate.
- Keep global state minimal.

---

# Project Goals

The project should maintain:

- clean architecture
- scalable folder structure
- reusable components
- strong typing
- secure authentication
- maintainable codebase
- modern React patterns
- production-ready code quality