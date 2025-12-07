# FleetFusion Architecture Guide

## 1. System Overview

FleetFusion is a **Server-First** web application built on Next.js 16. It prioritizes performance, type safety, and strict domain boundaries.

## 2. The "Server-First" Pattern

### 2.1 Data Flow

1.  **RSC (Page/Layout):** Fetches data using `*Fetchers.ts`.
2.  **Prop Drilling:** Passes data to Client Components (UI).
3.  **Interaction:** Client Components invoke `*Actions.ts` for mutations.
4.  **Revalidation:** Actions trigger `revalidatePath` or `revalidateTag` to refresh RSCs.

### 2.2 The "No-API" Rule

We do **not** use `src/app/api/*` for internal CRUD operations.

- **Read:** Use Server Components + Fetchers.
- **Write:** Use Server Actions.
- **Exceptions:** Webhooks (`api/clerk`), Health Checks (`api/health`), and external integrations.

## 3. Domain Isolation & Dependency

Domains should be loosely coupled.

- **Allowed:** A domain can import shared types or utilities from `src/lib`.
- **Discouraged:** Direct imports between domain `lib` files (e.g., `vehicles` importing directly from `drivers`).
- **Solution:** Use shared services in `src/lib` or composition at the Page level.

## 4. Observability Strategy

All Actions and Fetchers must be instrumented using `src/lib/observability`:

- **Logging:** `logger.info/error` with structured context (orgId, userId).
- **Metrics:** Record business metrics (e.g., `dispatch_load_created`).
- **Tracing:** Wrap critical paths with `wrapDomainActionInSpan`.

## 5. Security Model

- **Authentication:** Handled by Clerk Middleware.
- **Authorization:**
  - **Page Level:** `layout.tsx` checks permissions.
  - **Action Level:** `assertRole` called at the start of every Server Action.
  - **Data Level:** All Prisma queries must include `where: { organizationId }`.
