# Domain Spec: Analytics

## Scope
Dashboards, KPIs, custom reports.

## Entities
- `Report` (saved config), `Dashboard` (layout), derived metrics from domain tables.

## Server Actions
- `create-custom-report.action.ts`: save query definition (whitelisted fields).
- `schedule-report.action.ts`: set cadence, deliver via email.

## Business Rules
- Restrict selectable fields to avoid data leakage; always org-scoped.
- Large queries must paginate/limit; timeouts with graceful errors.

## Fetchers
- `get-dashboard.ts`: returns KPI set (loads, on-time rate, utilization, revenue est).
- `run-report.ts`: executes report definition with validation.

## UI
- Dashboard cards (RSC) with live data; client charts for interactivity; date filters.
