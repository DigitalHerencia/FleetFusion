# Domain Spec: Dispatch

## Scope

Load lifecycle, board management, assignments, status updates, customer linkage.

## Entities

- `Load` (status, origin/destination, dates, rate, customerId, driverId, vehicleId)
- `LoadStatusEvent` (history with timestamps, location)

## Core Flows

- Create load (pending)
- Assign driver/vehicle (assigned)
- Dispatch and track statuses (at_pickup → picked_up → en_route → at_delivery → delivered → pod_required → completed)
- Cancel/invoice

## Server Actions

- `create-load.action.ts`: validate, RBAC `dispatch:loads:create`, create load, revalidate board.
- `assign-load.action.ts`: attach driver/vehicle, update status, emit event.
- `update-load-status.action.ts`: append status event, enforce transition rules.
- `delete-load.action.ts`: soft delete with audit log.

## Business Rules

- Enforce valid status transitions (no delivered → pending).
- Warn on driver double-booking; allow admin override.
- Pickup < delivery date.

## Fetchers

- `list-loads.ts`: tenant-scoped, filter by status, cursor pagination.
- `get-load.ts`: detail view with status events and assignments.

## UI

- RSC board view; SSE for real-time updates; drag-and-drop client for columns.
- Forms using shadcn forms + RHF + Zod.
