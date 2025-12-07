# COMPLIANCE Domain Specification

## 1. Overview

The Compliance domain manages document tracking, expiration alerts, and audit-ready document storage for vehicles and drivers.

## 2. Directory Structure

This domain is implemented in `src/app/compliance/` and contains:

- **Schemas:** `schemas/compliance.schema.ts`
- **Actions:** `lib/complianceActions.ts`
- **Fetchers:** `lib/complianceFetchers.ts`
- **Hooks:** `lib/complianceHooks.ts`
- **Components:** `components/*` (ComplianceList, ComplianceCard, etc.)
- **Tests:** `tests/*`

## 3. Data Models

- `ComplianceDocument`
- `ExpirationAlert`

## 4. Key Features & Implementation

### 4.1 Document Management

- **Actions:** `createDocument`, `updateDocument`, `deleteDocument`, `uploadComplianceFile`
- **Fetcher:** `getAllComplianceDocuments`, `getComplianceDocumentById`
- **Validation:** `complianceDocumentSchema`

### 4.2 Expiration Alerts

- **Action:** `generateExpirationAlerts`
- **Fetcher:** `getExpirationAlerts`, `getComplianceSummary`
- **Hooks:** `useRealtimeComplianceAlerts`

### 4.3 Bulk Import

- **Action:** `bulkImportComplianceRecords`
- **Component:** `ComplianceBulkActions`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/complianceActions.test.ts`
  - `tests/complianceFetchers.test.ts`
  - `tests/complianceExpirationAlerts.test.ts`
