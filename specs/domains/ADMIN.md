# ADMIN Domain Specification

## 1. Overview

The Admin domain provides system-level management for roles, organizations, system documents, and database maintenance. It is restricted to super-admin users.

## 2. Directory Structure

This domain is implemented in `src/app/admin/` and contains:

- **Schemas:** `schemas/admin.schema.ts`
- **Actions:** `lib/adminActions.ts`
- **Fetchers:** `lib/adminFetchers.ts`
- **RBAC:** `lib/adminRBAC.ts`
- **Components:** `components/*` (RolesTable, OrganizationsTable, DatabaseStatusCards)
- **Tests:** `tests/*`

## 3. Data Models

- `Role`
- `Organization`
- `SystemDocument`

## 4. Key Features & Implementation

### 4.1 Role Management

- **Actions:** `createRole`, `updateRole`, `deleteRole`
- **Fetcher:** `getAllRoles`, `getRoleById`
- **RBAC:** `canManageRoles`

### 4.2 Organization Management

- **Actions:** `createOrganization`, `updateOrganization`, `deleteOrganization`
- **Fetcher:** `getAllOrganizations`, `getOrganizationById`
- **RBAC:** `canManageOrganizations`

### 4.3 System Maintenance

- **Action:** `refreshSystemIndexes`
- **Fetcher:** `getSystemDocuments`, `getAdminDashboardSnapshot`
- **Component:** `DatabaseStatusCards`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/adminActions.test.ts`
  - `tests/adminRBAC.test.ts`
  - `tests/adminPageview.test.ts`
