# IFTA Domain Specification

## 1. Overview

The IFTA domain handles fuel tax reporting, including trip mileage tracking, fuel purchase logging, and quarterly report generation.

## 2. Directory Structure

This domain is implemented in `src/app/ifta/` and contains:

- **Schemas:** `schemas/ifta.schema.ts` (tripSchema, fuelPurchaseSchema, iftaReportSchema)
- **Actions:** `lib/iftaActions.ts`
- **Fetchers:** `lib/iftaFetchers.ts`
- **Hooks:** `lib/iftaHooks.ts`
- **Components:** `components/*` (IftaTripsList, IftaFuelList, IftaReportCard)
- **Tests:** `tests/*`

## 3. Data Models

- `IftaTrip`
- `IftaFuelPurchase`
- `IftaReport`

## 4. Key Features & Implementation

### 4.1 Trip & Fuel Management

- **Actions:** `createTrip`, `updateTrip`, `deleteTrip`, `createFuelPurchase`, `updateFuelPurchase`, `deleteFuelPurchase`
- **Fetcher:** `getAllTrips`, `getTripById`, `getAllFuelPurchases`, `getFuelPurchaseById`

### 4.2 Quarterly Reports

- **Action:** `generateQuarterlyReport`
- **Fetcher:** `getQuarterlySummary`, `getRateTables`, `getIftaDashboardSnapshot`
- **Hooks:** `useIftaReportBuilder`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/iftaCalculations.test.ts` (Mileage, Tax computation)
  - `tests/iftaReports.test.ts` (Report generation, PDF export)
  - `tests/iftaPageview.test.ts`
