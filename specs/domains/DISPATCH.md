# DISPATCH Domain Specification

## 1. Overview

The Dispatch domain manages load creation, assignment, status tracking, and the dispatch board. It coordinates driver and vehicle assignments while enforcing business rules for load lifecycle transitions.

## 2. Directory Structure

This domain is implemented in `src/app/dispatch/` and contains:

- **Schemas:** `schemas/dispatch.schema.ts`
- **Actions:** `lib/dispatchActions.ts`
- **Fetchers:** `lib/dispatchFetchers.ts`
- **Hooks:** `lib/dispatchHooks.ts`
- **Status Rules:** `lib/dispatchStatusRules.ts`
- **Components:** `components/*` (DispatchBoard, DispatchCard, etc.)
- **Tests:** `tests/*`

## 3. Data Models

- `Load`
- `LoadStatusEvent`
- `DriverAssignment`

## 4. Key Features & Implementation

### 4.1 Load Management

- **Actions:** `createLoad`, `updateLoad`, `deleteLoad` (in `dispatchActions.ts`)
- **Fetcher:** `getAllLoads`, `getLoadById` (in `dispatchFetchers.ts`)
- **Validation:** `loadSchema` (in `dispatch.schema.ts`)

### 4.2 Assignment & Status

- **Actions:** `assignDriverToLoad`, `updateLoadStatus`
- **Rules:** `resolveLoadStatus`, `resolveDriverAvailability`, `inferNextStatusTransition` (in `dispatchStatusRules.ts`)

### 4.3 Dispatch Board

- **Fetcher:** `getDispatchBoardData`
- **Hooks:** `useRealtimeDispatchStatus`, `useDispatchWebsocket`
- **Component:** `DispatchBoard.tsx`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/dispatchActions.test.ts` (CRUD, Assignment)
  - `tests/dispatchFetchers.test.ts` (Board data, Pagination)
  - `tests/dispatchStatusRules.test.ts` (Transition logic)
- **Pageview Tests:** `tests/dispatchPageview.test.ts`
