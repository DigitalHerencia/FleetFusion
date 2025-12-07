# FleetFusion Architecture Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Objectives

- Domain-driven, server-first architecture using Next.js 16 (App Router) and React 19.
- RSC for data fetching; Server Actions for mutations.
- Prisma 7 + Neon PostgreSQL for multi-tenant persistence.
- Custom RBAC (no Clerk orgs) with tenant isolation in every query.
- Feature-driven modules with shared UI from shadcn/ui and Tailwind 4 design system.

## High-Level Architecture

- **Presentation:** Next.js App Router, RSC pages, shadcn/ui components, Tailwind 4.
- **Application:** Server Actions for mutations, fetchers for queries, domain services for business rules.
- **Domain:** DDD-aligned modules (auth, dispatch, vehicles, drivers, compliance, ifta, analytics, settings).
- **Infrastructure:** Prisma ORM, Neon PostgreSQL, Clerk auth, Svix webhook verification, Upstash rate limiting, Vercel Blob for files.
- **Cross-Cutting:** Observability (Sentry/Otel), feature flags, caching, audit logging, error handling.

## Request Flow (Server-First)

1. Request hits Next.js edge middleware for auth/tenant routing.
2. RSC page/component loads data via server-side fetchers (Prisma).
3. Mutations go through server actions with authz + validation + transactions.
4. Responses stream HTML with Suspense; client hydration only where needed.

## Folder Structure (proposed)

```
src/
  app/
    (marketing)/...
    (auth)/...
    (tenant)/[orgId]/(routes)
    api/
      webhooks/
        clerk/route.ts
      health/route.ts
  domains/
    auth/
    dispatch/
    vehicles/
    drivers/
    compliance/
    ifta/
    analytics/
    settings/
  shared/
    components/ui/        # shadcn base
    components/common/    # app-level UI
    lib/                  # db, auth, cache, utils
    schemas/              # shared zod
    types/                # shared TS
    hooks/
  infrastructure/
    middleware/
    webhooks/
    jobs/
  prisma/
    schema.prisma
    migrations/
  tests/
    unit/
    integration/
    e2e/
```

## Component Patterns

- **RSC pages:** Fetch via domain fetchers; pass data to pure UI components.
- **Client components:** Only when interactivity is required (forms, drag-and-drop, charts with tooltips).
- **Server Actions:** `domains/<domain>/actions/*.action.ts` with `'use server'`, Zod validation, RBAC check, Prisma tx, cache revalidation.
- **Fetchers:** `domains/<domain>/lib/fetchers.ts` — pure queries, tenant-scoped.
- **Domain Services:** `domains/<domain>/lib/services.ts` — business rules (status transitions, pricing, enforcement).
- **Schemas:** `domains/<domain>/schemas/*.schema.ts` — Zod for inputs/DTOs.
- **Types:** `domains/<domain>/types/*.ts` — API contracts and enums kept in sync with Prisma.

## Routing & Layouts

- Marketing group `(marketing)` for public pages.
- Auth group `(auth)` for sign-in/up/forgot/onboarding.
- Tenant group `(tenant)/[orgId]/` for all app features; layouts enforce auth + tenant context.
- API routes limited to webhooks/health; business logic via server actions.

## Tenant Isolation Strategy

- Tenant derived from session + pathname (`[orgId]`).
- Middleware enforces session + membership lookup; redirects unauthorized.
- Prisma middleware injects `organizationId` into queries (except on Organization itself).
- Cache keys include `organizationId`.

## Caching & Revalidation

- Use Next.js cache tags per domain resource (e.g., `org:{id}:loads`).
- Revalidate via `revalidateTag`/`revalidatePath` in server actions after mutations.
- Introduce Redis (Upstash) for hot caches and rate limits.

## Real-Time Updates

- Dispatch board: Server-Sent Events (SSE) baseline; optional WebSocket/Pusher later.
- Notification fan-out via `notification` table + polling/SSE.

## Error Handling

- Centralized domain error types (e.g., `AuthError`, `PermissionError`, `ValidationError`).
- RSC error boundaries per route segment.
- Logged to Sentry with org/user context.

## Performance

- Edge middleware for cheap auth gating.
- Avoid client bundles where possible; RSC-first.
- Database: scoped indexes per org, pagination via cursor.

## Migration Path

- Code-first: domains and shared; incremental enablement per route.
- Data: Prisma migrations targeting Neon branches; seed data for dev.

## Dependencies Alignment

- Next.js 16, React 19, TS 5, Clerk 6, Prisma 7, Tailwind 4, Zod 4, Svix 1, ESLint 9, Playwright 1, Vitest 4, Prettier 3, PostCSS 8.
