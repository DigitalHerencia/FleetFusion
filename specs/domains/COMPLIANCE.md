# Domain Spec: Compliance

## Scope

Document management, expiration tracking, audit readiness.

## Entities

- `Document` (entityType driver/vehicle/org, type, status, expiresAt, storageKey)
- `ComplianceAlert` (future) for reminders

## Server Actions

- `upload-document.action.ts`: signed upload URL, metadata persist, link to entity.
- `renew-document.action.ts`: update expiresAt/status, dismiss alerts.
- `delete-document.action.ts`: soft delete; keep audit trail.

## Business Rules

- Alerts at 90/60/30/14/7 days.
- Documents scoped to org and entity; mime/type/size validation.
- Sensitive docs require role `compliance` or `admin` to view.

## Fetchers

- `list-documents.ts`: filter by entity/type/status; pagination.
- `get-document.ts`: metadata + signed URL (time-limited).

## UI

- Compliance dashboard with expiry heatmap; document library with filters.
