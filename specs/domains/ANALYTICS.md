# ANALYTICS Domain Specification

## 1. Overview

The Analytics domain provides KPI dashboards, custom report building, and cross-domain metric aggregation for operational insights.

## 2. Directory Structure

This domain is implemented in `src/app/analytics/` and contains:

- **Schemas:** `schemas/analytics.schema.ts`
- **Actions:** `lib/analyticsActions.ts`
- **Fetchers:** `lib/analyticsFetchers.ts`
- **Hooks:** `lib/analyticsHooks.ts`
- **Components:** `components/*` (AnalyticsDashboardCards, AnalyticsReportDesigner)
- **Tests:** `tests/*`

## 3. Data Models

- `AnalyticsReport`
- `KPIDefinition`

## 4. Key Features & Implementation

### 4.1 Dashboard & KPIs

- **Fetcher:** `getAvailableKPIs`, `getAnalyticsDashboardSnapshot`, `getDomainMetrics`
- **Hooks:** `useRealtimeAnalyticsStream`
- **Component:** `AnalyticsDashboardCards`

### 4.2 Custom Reports

- **Actions:** `createCustomReport`, `updateCustomReport`, `deleteCustomReport`, `exportReportToPDF`
- **Fetcher:** `getReportById`, `getAllReports`, `runAnalyticsQuery`
- **Hooks:** `useAnalyticsQueryBuilder`, `useReportDesigner`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/analyticsQueries.test.ts`
  - `tests/analyticsReports.test.ts`
  - `tests/analyticsPageview.test.ts`
