---
applyTo: "\*/\*\*"
name: CopilotInstructions
description: "Authoritative coding rules for FleetFusion, tailored to your multi-tenant Clerk + Neon + Prisma + RSC architecture and spec-driven workflow."
---

# 🚨 **LLM AI Coding Partner — FleetFusion Edition**

This version replaces the generic “Next.js fullstack rules” with something actually tailored to **your existing repository structure**, **your spec-driven workflow**, **your domain boundaries**, and **your multi-tenant Clerk + Neon + Prisma + RSC architecture**.

---

# 1\. **Core Principles (Repository-Specific)**

### 1\. Server-first Everything

Use RSC by default. Every domain in `/src/app/(tenant)/[orgId]/*` should:

- Fetch with RSC fetchers under `src/app/**/lib/*Fetchers.ts`.
- Validate with schemas under `src/app/**/schemas`.
- Mutate via Server Actions under `src/app/**/lib/*Actions.ts`.

### 2\. Client Components Only Where Absolutely Required

Only use `"use client"` for:

- Hooks (`useRealtime…`, `useSearch…`, `useSort…`)
- Websocket/SSE consumers
- Interactive UI (forms, tables, drag & drop)

Every domain already follows this pattern strictly. Maintain it.

### 3\. Domain-Driven Layout

Your repo is already organized by domain (dispatch, vehicles, drivers, compliance, IFTA, analytics, settings, notifications, admin). This IS the pattern:

```
/src/app/(tenant)/[orgId]/
/src/app/auth
/src/app/docs
/src/app/api
/src/components/_
/src/lib/_
/src/prisma/_
/specs/_
```

Any new feature MUST fit into these existing boundaries.

### 4\. Reference the Specs as the _source of truth_

All code MUST be traceable to:

- PRD.md (behaviors and user stories)
- TECH_REQUIREMENTS.md (architecture & constraints)
- Domain specs (`specs/domains/*.md`)
- TODO.md (execution plan)  
  TODO

If the spec doesn't exist, the feature doesn’t get built. Period.

---

# 2\. **Project Structure Rules (Customized for FleetFusion)**

### **src/app/**

- **(marketing)** → Public site
- **auth/** → Clerk-powered flows (sign-in, sign-up, onboarding, invites)
- **(tenant)/\[orgId\]/** → All domain workspaces, with their own:
  - layout.tsx
  - page.tsx
  - schema/
  - lib/
  - components/
  - tests/
  - styles/

### **src/components/**

Global UI primitives, layouts, providers.  
Never add domain logic here.

### **src/lib/**

Shared server utilities, observability, RBAC, cache, files, pdf/excel modules, etc.  
Matches actual directories: rbac, org-router, upload, observability, storage adapters, PDF utils, Excel utils.

### **specs/**

All product, technical, architecture, data modeling, observability, design system, and domain specifications live here.  
These bind directly into TODO.md and CHANGELOG.md:  
TODO CHANGELOG

### **prisma/**

Schema, migrations, seeds.

---

# 3\. **Data Fetching Rules**

### 1\. Do not fetch inside Client Components.

All fetchers go in:

`src/app/**/lib/*Fetchers.ts`

### 2\. Always type the fetchers.

Your tests already expect typed returns in:

- getFleetOverview
- getComplianceSummary
- getDispatchBoardData
- getIftaDashboardSnapshot
- getSettingsDashboardSnapshot
- getNotificationDigest
- admin snapshots

### 3\. Use the domain-aware cache strategy:

From `src/lib/server/cache.ts`:

- `revalidateTagDuringMutations`
- `buildDomainCacheKey`

### 4\. No duplicate fetchers.

If two domains need the same fetcher, move it into shared lib, not copy/paste.

---

# 4\. **Mutations / Server Actions**

### Placement:

`src/app/**/lib/*Actions.ts`

Each action:

- Must use `'use server'`
- Must validate with Zod schema first
- Must enforce RBAC via `/src/lib/server/auth.ts` or domain-specific RBAC
- Must revalidate cache tags
- Must log via observability layer  
  (logger.ts, metrics.ts, tracing.ts)

Actions exist for every domain (vehiclesActions, driversActions, dispatchActions, etc.)—follow their patterns.

### Form handling:

- Use `useActionState()`
- Use `useFormStatus()`  
  Matches your existing UX patterns.

---

# 5\. **API Routes (Strict Limits)**

Only allowed under:

```
/src/app/api/\*
```

And ONLY for:

- health/ready probes
- Clerk webhooks (Svix verification)
- Public 3rd-party integrations

Internal CRUD is forbidden here.  
Server Actions own all business logic.

---

# 6\. **Tailwind CSS 4 Rules**

FleetFusion already uses:

- Token-driven theme (from DESIGN_SYSTEM.md)
- Dark-first strategy
- shadcn/ui RSC primitives
- CSS variables for colors, radius, sizing

Rules:

1.  No custom colors—use tokens.
2.  No hand-written component CSS.
3.  All reusable primitives stay in `/src/components/ui`.

---

# 7\. **React 19 Rules**

- `use()` for server data access in RSC components.
- `useOptimistic()` for optimistic UI (vehicles, dispatch, etc.)
- `useTransition()` for async transitions.
- Client components MUST be minimal, state-based, and testable.

---

# 8\. **TypeScript Rules**

- Strict mode is mandatory (tsconfig enforced).
- Never use `any`.
- Use `satisfies` for config objects.
- Use literal inference (`as const`).
- Schemas define types (`z.infer<typeof schema>`).

---

# 9\. **Testing Requirements**

Every domain already has domain-specific test suites:

- actions.test
- fetchers.test
- validation.test
- pageview.test
- mobileFlows.test
- RBAC tests

ALL new features must include equivalent coverage.

Vitest + Playwright coverage threshold = **80% minimum**.

---

# 10\. **Production Readiness Expectations**

Every PR must:

- Pass type checking
- Pass lint + formatting
- Pass domain test suite
- Update domain docs under `/src/app/docs`
- Update spec files if behavior changed
- Update TODO.md execution status  
  (spec-driven workflow: global.instructions)

---

# 11\. **Next.js 15 Async Params Pattern (MANDATORY)**

Your repo uses dynamic routes for every domain.

Correct usage:

```tsx
export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
}
```

Wrong:

```tsx
const { orgId } = params; // ❌ not allowed
```

Reference: stack.instructions

---

# 12\. **Spec-Driven Workflow Integration**

This applies globally across FleetFusion, per the official spec workflow:  
global.instructions

Every feature must:

1.  **Analyze**  
    Update PRD, Tech Requirements, Architecture, Domain Spec.
2.  **Design**  
    Produce interface signatures, data flow, dependencies.
3.  **Implement**  
    Follow domain folder structure exactly.
4.  **Validate**  
    Automated + manual testing.
5.  **Reflect**  
    Update docs, record decisions.
6.  **Handoff**  
    Generate PR summary, changelog entry  
    (CHANGELOG.md → CHANGELOG)

---

# 13\. **LLM + Copilot Agent Rules**

When generating new files or edits:

1.  Must fit existing domain folder pattern.
2.  Must update specs when behavior changes.
3.  Must update TODO.md when new work is required.
4.  Must follow the observability layer (tracing, logging).
5.  Must not introduce new unstated dependencies.
6.  Must implement the correct server-first pattern.
7.  Must produce production-ready code—not placeholders.
