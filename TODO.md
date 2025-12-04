# TODO

Backlog derived from `specs` (PRD v2.0, TECH_REQUIREMENTS v2.0, ARCHITECTURE v2.0, SECURITY v2.0, DATA_MODELING v2.0, DESIGN_SYSTEM v2.0, OBSERVABILITY v2.0, DEV_TOOLING v2.0).

## Foundational Platform & Infrastructure
- [ ] Establish Next.js 16 App Router skeleton with `(marketing)`, `(auth)`, and tenant `(tenant)/[orgId]` route groups per architecture spec.
- [ ] Configure TypeScript 5 strict/bundler paths (`@/*`, `@/domains/*`, `@/shared/*`) and Next.js ESLint 9 flat config rules (no `any`, explicit returns, exhaustive deps).
- [ ] Set up Tailwind CSS 4 with design tokens, typography, animate plugins, and dark-first theme from `DESIGN_SYSTEM.md`.
- [ ] Stand up Prisma 7 with Neon PostgreSQL connection (serverless driver), migrations folder, and seed pipeline.
- [ ] Implement middleware for tenant resolution, auth gating, and Prisma middleware to inject `organizationId`.
- [ ] Wire caching strategy (Next.js cache tags, Upstash Redis for hot caches and rate limiting) and default revalidation hooks in server actions.
- [ ] Configure Vercel Blob for file storage with signed URLs and 500MB limit enforcement.

## Security & Compliance
- [ ] Implement Clerk 6 auth session handling and custom RBAC tied to `OrganizationMembership.role` with permission matrix per domain.
- [ ] Enforce Zod validation on all inputs (server actions, webhooks, APIs) and payload size limits (1MB general, 256KB webhooks).
- [ ] Verify Svix signatures on Clerk webhooks with idempotency keyed on `svix-id`; log and alert failures.
- [ ] Add Upstash rate limiting (100 req/min default; tier-aware overrides) in middleware.
- [ ] Apply tenant isolation safeguards: scoped queries, org-aware cache keys, unique compound indexes.
- [ ] Configure CSP, secure cookies, HSTS, and secret management via environment managers.
- [ ] Implement audit logging for sensitive actions (auth changes, role changes, billing, deletes) with 1-year retention.

## Data Modeling & Persistence
- [ ] Author Prisma schema for core models: Organization, User, OrganizationMembership, Load + LoadStatusEvent, Vehicle, Driver, Document, IftaReport, IftaTrip, IftaFuelPurchase, AuditLog, Notification.
- [ ] Encode enums (SubscriptionTier/Status, UserRole, LoadStatus, VehicleStatus, DriverStatus, DocumentStatus, IftaReportStatus) per data modeling spec.
- [ ] Add soft-delete fields and audit stamps (`createdAt`, `updatedAt`, `deletedAt`, `createdById`, `updatedById`) where required.
- [ ] Create indexes and unique constraints for tenant isolation (e.g., `(organizationId, vin)`, `(organizationId, unitNumber)`, `(organizationId, status)`).
- [ ] Seed baseline data for dev (roles/permissions, sample org, drivers, vehicles).

## Design System & UX
- [ ] Implement Tailwind token layer (`:root` CSS variables) and dark-first theme per `DESIGN_SYSTEM.md`.
- [ ] Generate shadcn/ui primitives (rsc: true) and compose shared UI kit (`Button`, `Card`, `Table`, `Dialog`, `Toast`, navigation shell).
- [ ] Define typography and spacing scale; integrate Tailwind Typography for prose surfaces.
- [ ] Add motion patterns via `tailwindcss-animate` with reduced-motion support; ensure WCAG 2.1 AA contrast.

## Observability & Operations
- [ ] Enable OpenTelemetry tracing across RSC, server actions, and Prisma instrumentation; propagate correlation IDs (orgId/userId).
- [ ] Configure Pino structured logging (JSON) with org/user context; redact PII.
- [ ] Integrate Sentry for front/back error tracking; set sampling and environment tagging.
- [ ] Build health/readiness routes (`/api/health`, `/api/ready`) checking DB, Clerk, Redis, migrations.
- [ ] Define dashboards and alerts (error rate, latency, webhook failures) per `OBSERVABILITY.md`.

## Developer Tooling & CI/CD
- [ ] Standardize on pnpm + Node 20; add scripts for lint, type-check, test, test:coverage, test:e2e, format, prisma workflows.
- [ ] Configure Husky + lint-staged (pre-commit: eslint/prettier; optional vitest related; pre-push: test:ci-lite) per `DEV_TOOLING.md`.
- [ ] Establish Vitest + Playwright harness with fixtures and MSW; target >80% coverage gate.
- [ ] Add CI pipelines (lint, type-check, tests, build, prisma migrate deploy) and artifact uploads.
- [ ] Add Dependabot/Renovate configs per global instructions.

## Domain Delivery — Auth (PRD §5.2)
- [ ] AUTH-001 Registration: Clerk sign-up, default org creation, email verification, duplicate email handling.
- [ ] AUTH-002 Sign-In: Clerk auth with redirect to org dashboard; invalid credential throttling.
- [ ] AUTH-003 RBAC: Role enforcement for admin/manager/dispatcher/driver/compliance/accountant/viewer with immediate effect on role change.
- [ ] AUTH-004 Invitations: Create/revoke invitations, 7-day expiry, acceptance flow with org membership creation.

## Domain Delivery — Dispatch (PRD §5.3)
- [ ] DISP-001 Create Load: Form validation (pickup < delivery, required fields), unique load number, status `pending` default.
- [ ] DISP-002 Dispatch Board: Kanban view grouped by status, drag-and-drop updates, SSE refresh, show driver/vehicle assignments.
- [ ] DISP-003 Assign Driver: Availability filter by dates, warn on overlapping loads with override, audit assignment history, status to `assigned` + notify driver.
- [ ] DISP-004 Status Updates: Driver mobile updates (`at_pickup` → `delivered` etc.), timestamp + location capture, SSE push, offline queue/retry.

## Domain Delivery — Vehicles (PRD §5.4)
- [ ] VEH-001 Add Vehicle: Capture VIN/unit/make/model/year/type/plate; VIN validation; duplicate prevention; initial inspection records; trailer attributes.
- [ ] VEH-002 Maintenance: Schedule types (oil change, DOT, etc.), next service dates, alerts 30/14/7 days, completion logging (date/mileage/cost/notes).
- [ ] VEH-003 Inspections: Mobile-friendly checklists per vehicle type, defect flagging + manager notification, 6-month retention, block dispatch on critical defects.

## Domain Delivery — Drivers (PRD §5.5)
- [ ] DRV-001 Add Driver: Capture profile/CDL details; validate CDL format; create compliance docs; link to User for app access.
- [ ] DRV-002 CDL/Medical Tracking: Store expirations; alerts at 90/60/30/14/7 days; block assignments on expiry; document uploads.
- [ ] DRV-003 Hours of Service: Track duty statuses; enforce 11h driving/14h on-duty limits; warnings near limits; compliance dashboards.

## Domain Delivery — Compliance (PRD §5.6)
- [ ] COMP-001 Document Management: Upload/organize docs by entity; extract/store expirations; secure access; auditable access logs.
- [ ] COMP-002 Expiration Alerts: Configurable cadence (90/60/30/14/7); email + in-app notifications; auto-dismiss on renewal; urgency-sorted dashboard.

## Domain Delivery — IFTA (PRD §5.7)
- [ ] IFTA-001 Trip Mileage: Capture trip details and miles per jurisdiction; validate totals; support manual entry now, GPS later; aggregate per quarter.
- [ ] IFTA-002 Fuel Purchases: Capture fuel entries with receipts; validate within trip ranges; aggregate by jurisdiction.
- [ ] IFTA-003 Quarterly Reports: Calculate net tax by jurisdiction; generate IFTA-standard PDF/Excel; track report statuses (draft/final/filed).

## Domain Delivery — Analytics (PRD §5.8)
- [ ] ANLY-001 Dashboard: Show active loads, on-time rate, fleet utilization, revenue; date filters; near-real-time refresh; drill-down links.
- [ ] ANLY-002 Custom Reports: Report builder (Growth/Enterprise); filtering/grouping/aggregation; exports (PDF/Excel/CSV); save + scheduled runs.

## Domain Delivery — Settings (PRD §5.9)
- [ ] SET-001 Org Settings: Capture DOT/MC numbers, company info, logo; validate formats; propagate branding across app.
- [ ] SET-002 User Management: List users/roles/status; add/edit/deactivate; enforce role assignments; immediate access revocation on deactivate.
- [ ] SET-003 Subscription: Display tier/usage/billing; upgrade/downgrade flows; Stripe portal for payment methods; immediate feature gate updates.

## Quality & Acceptance (PRD §6, TECH §6)
- [ ] Enforce Definition of Done: code complete, docs updated, WCAG AA, LCP <2.5s/FID <100ms/CLS <0.1 where applicable.
- [ ] Quality gates in CI: lint, type-check, Vitest (>80% coverage), Playwright critical paths, security scan, Lighthouse/a11y where feasible.
- [ ] Document user help, API docs, and domain-specific guides alongside features.
