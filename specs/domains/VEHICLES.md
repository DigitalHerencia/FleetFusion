# Domain Spec: Vehicles

## Scope
Fleet inventory, maintenance, inspections, documents.

## Entities
- `Vehicle` (vin, unitNumber, type, status)
- `Maintenance` (type, scheduled/completed dates, cost, notes)
- `Inspection` (pre/post-trip, defects)
- `Document` (registration, insurance, etc.)

## Server Actions
- `create-vehicle.action.ts`: validate VIN, uniqueness per org.
- `schedule-maintenance.action.ts`: create maintenance, alerts.
- `complete-maintenance.action.ts`: mark done, update next service.
- `log-inspection.action.ts`: add inspection, flag defects.

## Business Rules
- VIN unique per org; unitNumber unique per org.
- Critical defects block dispatch assignments.
- Maintenance alerts at 30/14/7 days.

## Fetchers
- `list-vehicles.ts`: filter by status/type, cursor pagination.
- `get-vehicle.ts`: details with maintenance + inspections.

## UI
- Vehicle table + detail drawer; maintenance timeline; inspection checklist (client component).
