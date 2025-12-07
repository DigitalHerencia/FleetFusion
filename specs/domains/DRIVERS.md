# DRIVERS Domain Specification

## 1. Overview

The Drivers domain manages driver profiles, CDL/medical tracking, hours of service monitoring, and mobile workflows for shift management and document uploads.

## 2. Directory Structure

This domain is implemented in `src/app/drivers/` and contains:

- **Schemas:** `schemas/drivers.schema.ts`, `schemas/driversMobile.schema.ts`
- **Actions:** `lib/driversActions.ts`
- **Fetchers:** `lib/driversFetchers.ts`
- **Hooks:** `lib/driversHooks.ts`
- **Mobile Flows:** `lib/driversMobileFlows.ts`
- **Components:** `components/*` (DriversList, DriverCard, etc.)
- **Tests:** `tests/*`

## 3. Data Models

- `Driver`
- `DriverShift`
- `DriverDocument`

## 4. Key Features & Implementation

### 4.1 Driver Management

- **Actions:** `createDriver`, `updateDriver`, `deleteDriver`, `bulkImportDrivers`
- **Fetcher:** `getAllDrivers`, `getDriverById`, `getDriverHistory`
- **Validation:** `driverSchema`

### 4.2 Mobile Workflows

- **Actions:** `startDriverShift`, `endDriverShift`, `syncDriverLocation`, `uploadDriverDocs`
- **Hooks:** `useRealtimeDriverStatus`, `useDriverAssignments`

### 4.3 Dashboard Integration

- **Fetcher:** `getDriversForDashboard`
- **Component:** `DriverCardOptimistic`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/driversActions.test.ts`
  - `tests/driversFetchers.test.ts`
  - `tests/driversMobileFlows.test.ts`
