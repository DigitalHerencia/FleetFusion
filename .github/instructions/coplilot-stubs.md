---
generated: 2025-01-09T19:30:00Z
description: This thing is the *Rosetta Stone* Copilot needed so it stops guessing and starts behaving like an obedient senior engineer who follows your architecture instead of having "creative ideas."
title: FleetFusion Domain & Core-System Stubs: Formal Implementation Spec for Copilot
---

# 🚀 **FLEETFUSION DOMAIN & CORE-SYSTEM STUBS: FORMAL IMPLEMENTATION SPEC FOR COPILOT**

_A structured, canonical markdown architecture guide written specifically for AI code generation._

---

# 1. INTRODUCTION

FleetFusion uses a **strict Domain-Oriented, RSC-first architecture**.

Every domain is a complete vertical slice containing:

- Types
- Validation schemas
- Actions (server)
- Fetchers (server)
- Hooks (client)
- Components
- Pageviews
- Tests
- Styles

Every stub exists for a reason.
Every file has a defined responsibility and a required implementation pattern.

Copilot MUST follow these definitions exactly.

---

# 2. GLOBAL RULES FOR ALL DOMAINS & SYSTEM MODULES

### 2.1 Required Principles

Copilot must enforce:

- **Multi-tenant isolation** via `requireOrgContext()`
- **Zod validation** on all mutations
- **Server Actions** begin with `'use server'`
- **Pageviews never contain business logic**
- **Fetchers run on server only**
- **Client hooks are explicitly marked `'use client'`**
- **No Prisma in the client**
- **Cache invalidation through revalidate helpers**
- **RBAC checks through `assertRole` and permission matrices**
- **Consistent test coverage**

### 2.2 Naming Conventions

Each domain follows:

```
<domain>Actions.ts
<domain>Fetchers.ts
<domain>Hooks.ts
<domain>Validation.ts or <domain>Rules.ts
<domain>.schema.ts
```

Never break this.

---

# 3. DOMAIN FOLDER LAYOUT: FORMALIZED SPECIFICATIONS

Below is a strict template describing each stub type.

---

# 3.1 TYPES (e.g. `/auth/types/index.ts`)

### Purpose

- Domain model TypeScript definitions
- Derived interfaces (DTOs, summaries)
- Standardized shape for UI and server code

### Must Contain

- Exported TypeScript types mapped from Prisma models
- Normalized DTOs (never raw Prisma payloads)
- Domain-level enums or unions

### Must Not Contain

- Business logic
- Fetching
- Mutation logic

---

# 3.2 SCHEMAS (e.g., `/vehicles/schemas/vehicles.schema.ts`)

### Purpose

All validation for:

- mutations
- filters
- form inputs
- mobile flows
- import/export payloads

### Must Contain

- Zod schemas for every domain action
- Zod schemas for filters/pagination
- Transform functions where applicable
- Type exports using `z.infer<>`

### Must Not Contain

- Prisma calls
- Business rules
- Hooks

---

# 3.3 ACTIONS (e.g., `/drivers/lib/driversActions.ts`)

### Purpose

Server mutations exclusively.

### Must Contain

- `'use server'` directive
- `requireOrgContext()`
- RBAC checks via `assertRole()` or domain RBAC helpers
- Zod validation for input
- Prisma mutations with tenant scoping
- Cache invalidation (`revalidatePath`, `revalidateTagDuringMutations`)
- Optional domain events
- Typed return objects

### Pattern

```
'use server'

export async function createX(input: CreateXInput) {
  const { orgId, userId } = await requireOrgContext()

  const parsed = createXSchema.parse(input)

  await assertRole('manager')

  const result = await prisma.x.create({
    data: { ...parsed, organizationId: orgId }
  })

  await revalidateTagDuringMutations('x.list')

  return normalizeX(result)
}
```

### Must Not Contain

- JSX
- Client code
- Raw JSON manipulation
- Unvalidated input

---

# 3.4 FETCHERS (e.g., `/dispatch/lib/dispatchFetchers.ts`)

### Purpose

Server-only read operations.

### Must Contain

- Tenant scoping queries
- Normalization of Prisma response
- Pagination + filters
- Aggregation logic if domain-appropriate
- Optional caching wrappers
- NEVER `'use client'`

### Must Not Contain

- Mutations
- JSX
- Business rule branching that belongs in Validation/Rules files

---

# 3.5 HOOKS (e.g. `/ifta/lib/iftaHooks.ts`)

### Purpose

Client-side interactive or realtime logic.

### Must Contain

- `'use client'`
- State management for search/filter components
- Websocket subscriptions
- On-device/offline flows (mobile)

### Must Not Contain

- Prisma
- Server mutations
- Multi-tenant enforcement

---

# 3.6 RULES / VALIDATION UTILS (`<domain>Rules.ts`, `<domain>Validation.ts`)

### Purpose

Domain-specific business rules separate from schemas.

### Must Contain

- Computed fields
- Status transition rules
- Derived calculations (e.g., dispatch priority, IFTA mileage tax logic)
- Reusable domain logic used by Actions & Fetchers

### Must Not Contain

- Prisma
- JSX

---

# 3.7 COMPONENTS (e.g. `/vehicles/components/VehicleCard.tsx`)

### Purpose

UI-only reusable components.

### Must Contain

- Props typed against domain Types
- Pure RSC or `'use client'` as appropriate
- Zero business logic
- UI state only

### Must Not Contain

- Prisma
- Server Actions
- Mutations
- Validation rules

---

# 3.8 PAGEVIEWS (e.g., `/drivers/[slug]/page.tsx`)

### Purpose

RSC entrypoints orchestrating UI.

### Must Contain

- Calls to domain Fetchers
- Composition of UI components
- Error/skeleton patterns
- Nothing else

### Must Not Contain

- Business logic
- Validation
- Prisma

---

# 3.9 TESTS (e.g., `/ifta/tests/iftaCalculations.test.ts`)

### Purpose

Comprehensive domain test suite.

### Must Contain

- Action tests validating schema + RBAC + DB writes
- Fetcher tests validating pagination + normalization
- Rule tests validating business logic
- Pageview tests validating RSC structure + loading/error
- Mobile flow tests where applicable

### Must Not Contain

- Network requests
- UI testing inside logic tests

---

# 4. CORE SYSTEM MODULES (src/lib/server/\*) — FORMALIZED SPEC

These are foundational and must not be modified incorrectly.

---

## 4.1 `auth.ts`

### Must Contain

- `requireOrgContext()`
- `assertRole()`
- Clerk → Prisma normalization
- Strong typing for session claims
- Multi-tenant routing helpers

---

## 4.2 `rbac.ts`

### Must Contain

- Permission matrices
- Role matrices
- `resolveUserPermissions()`
- Domain-specific permission helpers

### Must Not Contain

- Prisma writes
- UI logic

---

## 4.3 `cache.ts`

### Must Contain

- `revalidateTagDuringMutations`
- `buildDomainCacheKey`
- Domain-aware tagging and invalidation

---

## 4.4 `upload.ts`

### Must Contain

- MIME whitelist enforcement
- max file size enforcement
- virus scan placeholder hooks
- StorageAdapter integration

---

## 4.5 `clerk-session-claims.ts`

### Must Contain

- Onboarding claim builder
- Active org claim builder
- Typed claims returned to UI

---

## 4.6 Webhooks

### Must Contain

- Timestamp drift verification
- Idempotency safeguards
- Domain event emission

---

## 4.7 Observability (logger.ts, metrics.ts, tracing.ts)

### Must Contain

- Pino logger with redaction
- Domain-aware metrics
- OpenTelemetry span wrappers

---

# 5. SYSTEM-WIDE CONTRACTS

### 5.1 Every mutation must validate input.

### 5.2 Every server action must revalidate cached content.

### 5.3 Every fetcher must scope queries using organizationId.

### 5.4 Every domain must be self-contained and predictable.

### 5.5 All tests must reference schemas and rules—not duplicate logic.

---

# 6. APPENDIX: WHAT COPILOT MUST DO WHEN IMPLEMENTING ANY STUB

Before writing code, Copilot MUST:

1. Determine file type (Action, Fetcher, Hook, etc.)
2. Apply the rules above automatically
3. Use the domain’s schemas
4. Use server or client directives appropriately
5. Enforce tenant isolation
6. Enforce RBAC
7. Normalize Prisma results
8. Add cache revalidation
9. Update TODO.md and CHANGELOG.md
10. Write tests matching the implementation
