# TODO

Backlog derived from `specs` (PRD v2.0, TECH_REQUIREMENTS v2.0, ARCHITECTURE v2.0, SECURITY v2.0, DATA_MODELING v2.0, DESIGN_SYSTEM v2.0, OBSERVABILITY v2.0, DEV_TOOLING v2.0).

**Last Audit:** December 7, 2025 | **Confidence Score:** 72% | **Audit Report:** `.agent/AuditReport.md`

---

## Foundational

### Outstanding

- [ ] **INFRA-001** Create `src/middleware.ts` for Clerk auth gating, tenant resolution, and org context injection.
- [ ] **INFRA-002** Implement `src/lib/server/auth.ts` with `requireOrgContext()` returning `{ orgId, userId, role, permissions }`.
- [ ] **INFRA-003** Implement `src/lib/server/rbac.ts` with permission matrix and `assertRole()` / `hasPermission()` guards.
- [ ] **PATH-001** Fix `@/domains/*` path alias (either create `src/domains/` or update `tsconfig.json` mapping).
- [ ] **CACHE-001** Wire caching strategy (Next.js cache tags, Redis rate limiting) and default revalidation hooks in server actions. _(blocked until INFRA-001/INFRA-002/INFRA-003)_
- [ ] **BLOB-001** Configure Vercel Blob for signed uploads with 500MB limits and retention policies.

### Completed (Audit Verified)

- [x] Established Next.js 16 App Router skeleton with `(marketing)`, `(auth)`, and domain route groups per architecture spec.
- [x] Configured TypeScript strict/bundler settings and ESLint 9 flat config with import sorting and accessibility rules.
- [x] Set up Tailwind CSS 4 token layer, typography, animate plugins, and dark-first theme from `DESIGN_SYSTEM.md`.
- [x] Stood up Prisma 7 with PostgreSQL datasource and initial migration applied.

---

## Security

### Outstanding

- [ ] **SEC-001** Implement Clerk session handling and RBAC tied to `OrganizationMembership.role` with permission matrix per domain. _(blocked until INFRA-001/INFRA-002/INFRA-003)_
- [ ] **SEC-002** Enforce Zod validation on all inputs (server actions, webhooks, APIs) with payload limits (1MB general, 256KB webhooks).
- [ ] **SEC-003** Verify Svix signatures on Clerk webhooks with idempotency keyed on `svix-id`; log and alert failures.
- [ ] **SEC-004** Add Redis-backed rate limiting (100 req/min default; tier-aware overrides) in middleware. _(blocked until INFRA-001)_
- [ ] **SEC-005** Configure CSP, secure cookies, HSTS, and secret management via environment managers.
- [ ] **SEC-006** Implement audit logging for sensitive actions with 1-year retention (AuditLog model present). _(blocked until INFRA-002/INFRA-003)_

### Completed (Audit Verified)

- [x] Applied tenant isolation safeguards in Prisma (organizationId scoping and compound indexes) to enforce multi-tenancy boundaries.

---

## Data Modeling

### Outstanding

- [ ] **DATA-001** Seed baseline data for development (roles/permissions, sample org, drivers, vehicles, feature flags).

### Completed (Audit Verified)

- [x] Authored comprehensive Prisma schema covering organizations, users, membership, loads, vehicles, drivers, documents, IFTA, notifications, audit logs, and idempotency tokens (with enums, soft deletes, audit stamps, indexes).

---

## Domains

### Reference Domain — Vehicles (Blocked by INFRA-001/INFRA-002/INFRA-003)

- [ ] **VEH-SCHEMA** Implement `src/app/vehicles/schemas/vehicles.schema.ts` with full Zod v4 validation. _(blocked)_
- [ ] **VEH-FETCHERS** Implement `src/app/vehicles/lib/vehiclesFetchers.ts` with `getVehicles()`, `getVehicleBySlug()`, `getVehicleStats()`. _(blocked)_
- [ ] **VEH-ACTIONS** Implement `src/app/vehicles/lib/vehiclesActions.ts` with `'use server'` create/update/delete/bulkImport and cache revalidation. _(blocked)_
- [ ] **VEH-TESTS** Replace `src/app/vehicles/tests/*.test.ts` stubs with real assertions using Prisma/auth mocks. _(blocked)_
- [ ] **VEH-PAGE** Update `src/app/vehicles/page.tsx` to render data from fetchers. _(blocked)_

### Other Domain Backlog (All remain scaffold-only; blocked by foundational auth/RBAC)

- [ ] **AUTH-001** Registration: Clerk sign-up, default org creation, email verification, duplicate handling. _(blocked)_
- [ ] **AUTH-002** Sign-In: Clerk auth with redirect to org dashboard; throttling on invalid credentials. _(blocked)_
- [ ] **AUTH-003** RBAC: Enforce roles (owner/admin/manager/dispatcher/driver/compliance/accountant/viewer). _(blocked)_
- [ ] **AUTH-004** Invitations: Create/revoke invitations, expiry, acceptance with membership creation. _(blocked)_
- [ ] **DISP-001** Create Load with validation, unique numbers, default `pending`. _(blocked)_
- [ ] **DISP-002** Dispatch Board with Kanban, drag-and-drop, SSE refresh, assignments. _(blocked)_
- [ ] **DISP-003** Assign Driver with availability checks, overlap warnings, audit history, notifications. _(blocked)_
- [ ] **DISP-004** Status Updates from mobile with timestamps/location and retry queue. _(blocked)_
- [ ] **DRV-001** Add Driver with CDL validation, compliance docs, user linkage. _(blocked)_
- [ ] **DRV-002** CDL/Medical tracking with expiration alerts and assignment blocks. _(blocked)_
- [ ] **DRV-003** Hours of Service enforcement with limit warnings and dashboards. _(blocked)_
- [ ] **COMP-001** Document management by entity with access controls and audit logs. _(blocked)_
- [ ] **COMP-002** Expiration alerts cadence with notifications and dismissal flows. _(blocked)_
- [ ] **IFTA-001** Trip mileage capture/validation with jurisdiction totals. _(blocked)_
- [ ] **IFTA-002** Fuel purchase capture within trip ranges and jurisdiction aggregation. _(blocked)_
- [ ] **IFTA-003** Quarterly reports with tax calculations and export (PDF/Excel). _(blocked)_
- [ ] **ANLY-001** Analytics dashboard (loads, on-time rate, utilization, revenue) with filters. _(blocked)_
- [ ] **ANLY-002** Custom reports builder with exports and scheduling. _(blocked)_
- [ ] **SET-001** Org settings (DOT/MC, company info, branding) with validation. _(blocked)_
- [ ] **SET-002** User management (list/edit/deactivate) with immediate role enforcement. _(blocked)_
- [ ] **SET-003** Subscription management with Stripe portal and feature gates. _(blocked)_

### Completed (Audit Verified)

- [x] Domain scaffolds exist for auth, dashboard, vehicles, drivers, dispatch, compliance, ifta, analytics, settings, notifications, admin (pages, layouts, placeholders).

---

## Observability

### Outstanding

- [ ] **OBS-001** Implement `src/lib/observability/logger.ts` with Pino structured logging (JSON with orgId/userId context).
- [ ] **OBS-002** Implement `src/lib/observability/tracing.ts` with OpenTelemetry wrappers for server actions and Prisma.
- [ ] **OBS-003** Upgrade `/api/ready` to perform real DB, Clerk, and migration checks (currently returns static status).
- [ ] **OBS-004** Implement metrics instrumentation (request counters, latency histograms, webhook failures) aligned to `OBSERVABILITY.md`.

### Completed (Audit Verified)

- [x] Health/readiness endpoints scaffolded (`/api/health`, `/api/ready`) per platform requirements.

---

## CI / Tooling

### Outstanding

- [ ] **CI-001** Wire Husky hooks to run `pnpm lint-staged` (pre-commit) and ensure scripts execute (current hooks source helper only).
- [ ] **CI-002** Replace domain unit test stubs with real coverage across all actions/fetchers (blocked until domain logic exists).
- [ ] **CI-003** Create `e2e/` folder with Playwright smoke tests (health, auth, navigation). _(blocked until INFRA-001/INFRA-002/INFRA-003)_
- [ ] **CI-004** Add MSW handlers in `tests/mocks/` for Prisma and Clerk mocking. _(blocked until INFRA-002/INFRA-003)_

### Completed (Audit Verified)

- [x] Standardized on pnpm + Node 20 with scripts for lint, type-check, test, coverage, e2e, format, and Prisma workflows.
- [x] Established Vitest and Playwright configs; generated test scaffolds for all domains.
- [x] Added CI workflows (lint, type-check, test, build, prisma migrate deploy) with frozen lockfile installs and cached pnpm.
- [x] Added Dependabot/Renovate automation per global instructions.

---

## Quality & Acceptance

### Outstanding

- [ ] Enforce Definition of Done: code complete, docs updated, WCAG AA, LCP <2.5s/FID <100ms/CLS <0.1 where applicable.
- [ ] Quality gates in CI: lint, type-check, Vitest (>80% coverage), Playwright critical paths, security scan, Lighthouse/a11y where feasible.
- [ ] Document user help, API docs, and domain-specific guides alongside features.

---

## 📋 Execution Plan Summary

```
Phase 1: Foundation Lock-in (INFRA-001 → INFRA-003, PATH-001)
    ↓
Phase 2: Security & Data (SEC-*, DATA-001, CACHE-001, BLOB-001)
    ↓
Phase 3: Reference Domain (VEH-*)
    ↓
Phase 4: Parallel Domains (AUTH/DRV/SET/DISP/COMP/IFTA/ANLY)
    ↓
Phase 5: Observability & CI Hardening (OBS-*, CI-*)
```

**Safe to start now:** INFRA-001 (middleware.ts) has no upstream dependencies.

---

## 📁 Agent Resources

| Resource         | Path                          | Purpose                            |
| ---------------- | ----------------------------- | ---------------------------------- |
| Audit Report     | `.agent/AuditReport.md`       | Full workspace audit with findings |
| Directory Tree   | `.agent/directory-tree.txt`   | Project structure snapshot         |
| Structure Script | `.agent/create_structure.ps1` | PowerShell scaffold automation     |

_Add new scripts to `.agent/` for batch operations, migrations, and automation._
