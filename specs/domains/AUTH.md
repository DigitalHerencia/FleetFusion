# AUTH Domain Specification

## 1. Overview

The Auth domain handles user authentication, organization onboarding, invitation management, and RBAC enforcement. It integrates with Clerk for identity management and extends it with custom session claims.

## 2. Directory Structure

This domain is implemented in `src/app/auth/` and contains:

- **Schemas:** `schemas/auth.schema.ts`, `schemas/onboarding.schema.ts`, `schemas/invites.schema.ts`
- **Actions:** `lib/authActions.ts`
- **Fetchers:** `lib/authFetchers.ts`
- **RBAC:** `lib/authRBAC.ts`
- **Components:** `components/*` (InviteForm, OnboardingForm, etc.)
- **Tests:** `tests/*`

## 3. Data Models

- `User`
- `Organization`
- `OrganizationMembership`
- `Invite`

## 4. Key Features & Implementation

### 4.1 Sign Up & Sign In

- **Pages:** `[[...sign-in]]/page.tsx`, `[[...sign-up]]/page.tsx`
- **Action:** `signUpWithProfile` (in `authActions.ts`)
- **Fetcher:** `getCurrentUserWithOrgs` (in `authFetchers.ts`)

### 4.2 Onboarding

- **Page:** `onboarding/page.tsx`
- **Action:** `completeOnboarding`
- **Fetcher:** `getOnboardingState`
- **Validation:** `onboardingSchema`

### 4.3 Invitation Management

- **Pages:** `invites/page.tsx`, `invites/[token]/page.tsx`
- **Actions:** `createInvite`, `acceptInvite`, `revokeInvite`
- **Fetcher:** `getPendingInvitesForOrg`, `getInviteByToken`

## 5. Testing Strategy

- **Unit Tests:**
  - `tests/authActions.test.ts` (Sign-up, Onboarding, Invites)
  - `tests/authFetchers.test.ts` (User queries)
- **Flow Tests:**
  - `tests/onboardingFlow.test.ts`
  - `tests/inviteLifecycle.test.ts`
