---
description: Review code against FleetFusion's strict architectural and security standards.
---

# FleetFusion Code Review Instructions

Review the code specifically checking for adherence to the **FleetFusion Architecture** and **Spec-Driven Workflow**.

## 1. Architecture & Patterns

- **Server-First**: Are Server Components used by default? Is `"use client"` only used for interactivity?
- **Domain Isolation**: Does code in `src/app/(tenant)/[orgId]/[domain]` respect domain boundaries? Are shared utilities properly located in `src/lib`?
- **Data Fetching**:
  - Are fetchers in `lib/*Fetchers.ts`?
  - Are they typed?
  - Is the domain-aware cache strategy (`buildDomainCacheKey`) used?
- **Mutations**:
  - Are Server Actions in `lib/*Actions.ts`?
  - Do they use `'use server'`?
  - Is `useActionState` used in the UI?

## 2. Security & Validation

- **RBAC**: Does every Server Action check permissions via `src/lib/server/auth.ts`?
- **Input Validation**: Is Zod used to validate ALL inputs in Server Actions?
- **Data Leaks**: Are sensitive fields (like internal IDs or secrets) exposed to the client unnecessarily?

## 3. Performance & Best Practices

- **N+1 Queries**: Check for loops triggering database calls.
- **Image Optimization**: Are `next/image` and proper sizing used?
- **React 19**: Are `use()`, `useOptimistic()`, and `useTransition()` used correctly?

## 4. Code Quality & Specs

- **Type Safety**: No `any`. Strict null checks.
- **Tailwind 4**: Are design tokens used? No magic hex codes.
- **Spec Alignment**: Does the implementation match the logic described in the associated `specs/domains/*.md` file?
- **Tests**: Are there corresponding tests in the `tests/` folder?

## 5. Tone

- Be constructive but strict about architectural patterns.
- Flag any "quick hacks" that violate the `global.instructions.md` workflow.
