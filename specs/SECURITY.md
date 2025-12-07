# FleetFusion Security Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Objectives

- Protect tenant data with strict isolation and RBAC.
- Verify all webhooks and external inputs (Svix for Clerk).
- Enforce secure defaults in Next.js, Prisma, and infrastructure.

## Vulnerability Reporting

Please refer to `.github/SECURITY.md` for the official vulnerability reporting policy and contact information.

## Threat Model (abridged)

- **Multi-tenant data leakage:** Cross-tenant query without org filter.
- **AuthZ bypass:** Missing role/permission checks on mutations.
- **Webhook spoofing:** Unverified Clerk webhook.
- **Input abuse:** Injection, mass assignment, oversized payloads.
- **Availability:** DoS via unauthenticated or abusive requests.

## Controls

- **Authentication:** Clerk 6 sessions; middleware enforces auth on tenant routes.
- **Authorization:** Custom RBAC via `OrganizationMembership.role`; permission matrix per domain; guard every server action and fetcher.
- **Tenant Isolation:** Prisma middleware to inject `organizationId`; unique compound keys per org; cache keys include org.
- **Validation:** Zod 4 on every input (server actions, API routes, webhooks).
- **Webhook Verification:** Svix signature verification for Clerk; reject on failure; log and alert.
- **Rate Limiting:** Upstash sliding window (100 req/min per user; configurable per tier); higher limits for enterprise.
- **Transport Security:** TLS 1.3 enforced by platform; HSTS enabled; cookies `Secure`, `HttpOnly`, `SameSite=Lax`.
- **Data Protection:** PII minimized; encryption at rest (Neon/Vercel), in transit (TLS). File storage via Vercel Blob with signed URLs.
- **Secrets Management:** Env vars via Vercel/Neon; no secrets in repo; rotate keys quarterly.
- **Audit Logging:** `AuditLog` table for sensitive actions (auth changes, role changes, billing, deletes); append-only.
- **Error Handling:** Safe error messages; detailed logs to Sentry with org/user context; no stack traces to user.
- **Content Security Policy:** Restrictive defaults; allow Clerk, Vercel assets, analytics endpoints; block inline scripts where possible.

## Clerk Webhook Handler Requirements

- Verify Svix headers (`svix-id`, `svix-timestamp`, `svix-signature`).
- Parse payload safely; size limit 256KB.
- Process events in Prisma transaction; upsert user; log webhook event.
- Idempotency: use `svix-id` as unique key in `WebhookEvent` to avoid double-processing.
- On failure: respond 400; log to Sentry; enqueue retry (future queue).

## RBAC / Permission Matrix (summary)

- Roles: `admin`, `manager`, `dispatcher`, `driver`, `compliance`, `accountant`, `viewer`.
- Permission categories: `dispatch:*`, `vehicles:*`, `drivers:*`, `compliance:*`, `ifta:*`, `analytics:*`, `settings:*`, `billing:*`.
- Enforcement: server actions check permissions; UI gates client-side for UX but never as sole enforcement.

## Multi-Tenancy Safeguards

- All queries include `organizationId` where applicable.
- Unique constraints on `(id, organizationId)` for child entities as needed.
- Background jobs include org scope; no cross-tenant batch jobs.
- Feature flags evaluated per org.

## Input & Payload Limits

- Body size: 1MB default for API routes; 256KB for webhooks.
- File uploads: enforce mime type + size (<=500MB) via Vercel Blob signed URLs.

## Logging & Monitoring

- Sentry for errors; OpenTelemetry traces for server actions and key fetchers.
- Pino structured logs with orgId/userId correlation IDs.
- AuditLog DB table; retention 1 year; exportable for compliance.

## Compliance & Privacy

- GDPR readiness: data export/delete by org; soft-delete users; hard-delete on request.
- Data residency: primary US region; document if multi-region later.
- Backups: Neon automated; point-in-time recovery.

## Security Checklist (operational)

- [ ] Webhook signatures verified and tested
- [ ] All mutations have RBAC checks
- [ ] All inputs validated (Zod)
- [ ] Prisma middleware for tenant scoping enabled
- [ ] Rate limiting enabled in middleware
- [ ] CSP configured and tested
- [ ] Secrets stored only in env managers
- [ ] Audit log coverage for sensitive actions
- [ ] Sentry DSN configured; traces sampled
