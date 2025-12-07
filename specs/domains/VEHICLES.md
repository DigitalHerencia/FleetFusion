# VEHICLES Domain Specification

## 1. Overview

The Vehicles domain manages the fleet inventory, including trucks, trailers, and service vehicles. It handles vehicle lifecycle, maintenance scheduling, inspection logging, and compliance document tracking related to assets.

## 2. Directory Structure

This domain is implemented in `src/app/vehicles/` and contains:

- **Schemas:** `schemas/vehicles.schema.ts`
- **Actions:** `lib/vehiclesActions.ts`
- **Fetchers:** `lib/vehiclesFetchers.ts`
- **Hooks:** `lib/vehiclesHooks.ts`
- **Validation:** `lib/vehiclesValidation.ts`
- **Components:** `components/*` (VehiclesList, VehicleCard, etc.)
- **Tests:** `tests/*`

## 3. Data Models

- `Vehicle`
- `MaintenanceRecord`
- `Inspection`
- `VehicleDocument`

## 4. Key Features & Implementation

### 4.1 Vehicle Management

- **Action:** `createVehicle`, `updateVehicle`, `deleteVehicle` (in `vehiclesActions.ts`)
- **Fetcher:** `getAllVehicles`, `getVehicleById` (in `vehiclesFetchers.ts`)
- **Validation:** `vehicleSchema` (in `vehicles.schema.ts`)

### 4.2 Dashboard Integration

- **Fetcher:** `getVehiclesForDashboard`
- **Component:** `VehicleCardOptimistic`

### 4.3 Bulk Operations

- **Action:** `bulkImportVehicles`
- **Component:** `VehiclesBulkActions`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/vehiclesActions.test.ts` (CRUD, Validation)
  - `tests/vehiclesFetchers.test.ts` (Filtering, Pagination)
  - `tests/vehiclesValidation.test.ts` (Schema rules)
- **Pageview Tests:** `tests/vehiclesPageview.test.ts` (RSC rendering, Client hydration)
