# Observability

FleetFusion’s observability plan uses structured logs, traces, metrics, error tracking, and health endpoints to help detect reliability issues and understand operational behavior.

## Signals and purpose

| Signal             | Use                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- |
| Structured logs    | Investigate application events and failures with request and organization context  |
| Distributed traces | Follow a request across pages, server actions, and database operations             |
| Metrics            | Monitor reliability and business measures over time                                |
| Error tracking     | Group and triage frontend and backend exceptions                                   |
| Health checks      | Report basic service health and readiness, including database and migration checks |

The observability specification identifies OpenTelemetry, Pino, Sentry, and Vercel Analytics/custom metrics as the planned stack. Production integrations and dashboard availability depend on deployment configuration.

## Dashboard areas

- **Reliability:** error rate, latency percentiles, throughput, and saturation.
- **Business:** loads created per day, on-time rate, expiring documents, and IFTA reports filed.
- **Database:** slow queries, connection-pool use, and database errors.

## Alert thresholds in the specification

| Condition                                  | Response |
| ------------------------------------------ | -------- |
| Error rate above 1% for 5 minutes          | Page     |
| p95 latency above 800 ms for 5 minutes     | Warn     |
| Database error rate above 0.5%             | Page     |
| More than 3 webhook failures in 10 minutes | Warn     |

These are documented target thresholds. Confirm the active alert configuration in the deployment’s monitoring system.

## Logging and privacy

Use structured fields such as timestamp, level, message, organization ID, user ID, path, action, duration, and error where appropriate. Minimize personal data and never log credentials, tokens, or secret values. Apply access and retention policies to logs and traces.

The specification describes `/api/health` for service checks and `/api/ready` for migration readiness; verify the deployed endpoints and their current behavior before using them in automation.

Related: [Configuration reference](/docs/reference/configuration), [Security and access model](/docs/reference/security).
