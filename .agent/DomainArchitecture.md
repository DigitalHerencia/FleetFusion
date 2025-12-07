---
generated: 2024-06-05 12:00:00
title: Domain Architecture Specification
description: You are working inside the FleetFusion codebase, which uses a strict Domain-Oriented, RSC-first architecture. Before generating or editing ANY code, you must understand and follow the formal domain structure described below.
---

====================================================================
🚨 FLEETFUSION DOMAIN ARCHITECTURE — FORMAL SPEC FOR COPILOT
====================================================================

Each domain in FleetFusion is a _complete, vertically integrated module_ that contains everything required for its functionality, including:

1. **types/** — Shared TypeScript domain types.
2. **schemas/** — Zod schemas that define validation rules for forms, actions, filters, and domain objects.
3. **lib/** — All domain logic split into:
   - `<domain>Actions.ts`: React Server Actions implementing mutations.
   - `<domain>Fetchers.ts`: Server-only data loaders.
   - `<domain>Hooks.ts`: Client-only hooks for interactivity.
   - `<domain>Validation.ts` or `<domain>Rules.ts`: Derived logic, guard rails, domain rules.

4. **components/** — Pure or client components used by pageviews.
5. **tests/** — A full suite, including:
   - Actions tests
   - Fetcher tests
   - Schema validation tests
   - Rules/logic tests
   - Pageview tests (Playwright or Vitest)

6. **pageviews** (RSC pages):
   - `page.tsx`: Main page entrypoint for domain index.
   - `[slug]/page.tsx`: Detail page.
   - `new/page.tsx`: Creation form.
   - `edit/page.tsx`: Editing form.
   - `loading.tsx`: Skeleton for RSC.
   - `error.tsx`: Failure fallback.

====================================================================
🔥 DOMAIN EXECUTION FLOW (FORMALIZED)
====================================================================

Every domain follows this pipeline:

1. **Pageview → Fetchers**  
   RSC page loads domain data via fetchers.  
   Fetchers:
   - must run on server
   - must call Prisma
   - must enforce multi-tenant org scoping
   - must return normalized, typed payloads

2. **Components → Presentation**  
   Pageviews compose:
   - header component
   - filters component
   - list or detail component
   - optimistic UI variants
   - skeletons and error surfaces

3. **Actions → Mutations**  
   Actions:
   - MUST begin with `'use server'`
   - Validate input with Zod schemas
   - Call Prisma mutations
   - Call cache invalidation helpers
   - Emit domain events (future)
   - Return safe, typed results

4. **Hooks → Client Interactivity**  
   Hooks are only used when needed:
   - search
   - sort
   - websocket listeners
   - optimistic updates
     Hooks must be marked `'use client'`.

5. **Rules / Validation Layer**  
   Domain-specific logic:
   - business rules (e.g., load status transitions)
   - schema transformations
   - permission gating logic

6. **Tests**  
   Every domain must have:
   - Actions tests
   - Fetcher tests
   - Schema validation tests
   - Logic tests
   - Pageview tests validating composition and loading behavior

====================================================================
📐 WHY STUB FILES EXIST — FORMAL REASONING FOR COPILOT
====================================================================

Stub files are _not incomplete mistakes_.  
They are intentionally provided so Copilot and developers can:

- generate implementation code inside the correct domain boundary
- follow consistent naming and separation of concerns
- know the expected I/O formats
- understand pageview orchestration
- avoid leaking domain logic across modules
- make future TDD easier by snapping tests into pre-defined slots
- enforce multi-tenant safety by always entering through shared helpers

Copilot must:

- NOT collapse logic between domains
- NOT create cross-domain imports except fetcher → shared utils
- ALWAYS create actions/fetchers/schemas/hooks inside the domain folder
- ALWAYS follow the domain execution flow above

====================================================================
📌 IMPLEMENTATION RULES FOR COPILOT
====================================================================

Before writing code, Copilot MUST:

1. Inspect the folder the file is in.
2. Determine if this is an action, fetcher, hook, schema, component, test, or pageview.
3. Apply the correct architecture rules:
   - Actions → server mutations with validation + Prisma
   - Fetchers → server-only DB reads with org scoping
   - Hooks → client-only with event/state logic
   - Schemas → Zod definitions for inputs/filters/forms
   - Pageviews → RSC entrypoints calling fetchers
4. Ensure multi-tenant safety:
   - requireOrgContext()
   - prisma.\* queries must filter by organizationId
5. Ensure test coverage is meaningful and NOT placeholder.

====================================================================
🛑 DO NOT DO THE FOLLOWING
====================================================================

Copilot must never:

- Invent domain logic not defined in schemas or Prisma models
- Mix business rules into components
- Put client hooks in server files or vice versa
- Call Prisma in client code
- Mutate data without Zod validation
- Skip `'use server'` in Actions files
- Skip cache revalidation
- Create files outside the domain folder

====================================================================
🚀 NOW APPLY THIS SPEC
====================================================================

Using this formalized architecture description:

→ Interpret all existing stubs as intentional placeholders  
→ Fill them in following this structure  
→ Update the implementations so they remain consistent across all domains  
→ When generating new logic, mirror the patterns found in vehicles/ and auth/  
→ Ensure domain patterns remain uniform

Begin by confirming your understanding of this domain architecture before generating any code.
