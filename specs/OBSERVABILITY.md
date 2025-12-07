# FleetFusion Observability Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Goals

- Rapid detection of errors and performance regressions.
- Full request tracing across RSC, server actions, and Prisma.
- Actionable alerts with low noise.

## Stack

- **Tracing:** OpenTelemetry (Next.js + Prisma instrumentation)
- **Logging:** Pino structured logs; JSON; orgId/userId correlation IDs
- **Error Tracking:** Sentry (frontend + backend)
- **Metrics:** Vercel Analytics + custom Otel metrics
- **Uptime:** BetterStack or Pingdom

## Instrumentation Plan

- Enable Next.js OpenTelemetry export; wrap server actions to start spans.
- Prisma instrumentation for queries (duration, errors, target table).
- Add correlation IDs per request; propagate via headers/context.
- Log key business events (load status change, document upload, billing events).

## Dashboards

- **Reliability:** Error rate, latency p50/p95/p99, throughput, saturation.
- **Business KPIs:** Loads created/day, on-time rate, expiring docs, IFTA reports filed.
- **Database:** Slow queries, connection pool usage.

## Alerting Policy

- Error rate > 1% for 5 minutes -> page (Sentry alert).
- p95 latency > 800ms for 5 minutes -> warn.
- DB error rate > 0.5% -> page.
- Webhook failures > 3 in 10 minutes -> warn.

## Logging Standards

- JSON logs with fields: `timestamp`, `level`, `message`, `orgId`, `userId`, `path`, `action`, `durationMs`, `error`.
- Redact PII where not needed; never log secrets.

## Health & Readiness

- `/api/health` route: DB check, Clerk status, Redis check.
- `/api/ready` route: migration applied check.

## Testing Observability

- Add integration tests to assert logs are emitted for critical actions.
- Chaos testing (future) to validate alerting.
