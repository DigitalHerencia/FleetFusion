# Domain Spec: Drivers

## Scope

Driver roster, credentials, HOS tracking.

## Entities

- `Driver` (name, status, cdl info, medical card)
- `HosLog` (future) for hours-of-service
- `Document` (cdl, medical card)

## Server Actions

- `create-driver.action.ts`: add driver, link user optionally.
- `update-driver-status.action.ts`: suspend/activate; block assignments when suspended.
- `log-hos.action.ts` (future): append HOS entries with validations.

## Business Rules

- Enforce CDL format per state; expiration alerts 90/60/30/14/7 days.
- Suspended/expired drivers cannot be assigned to loads.

## Fetchers

- `list-drivers.ts`: filter by status; pagination.
- `get-driver.ts`: profile with docs and assignments.

## UI

- Driver directory with status chips; credential expiry widgets; compliance warnings inline.
