# Authentication, Authorization, Tenancy, and Access — The Maximal Template™

## Purpose

This document describes the authentication, authorization, tenancy, onboarding, and access model implemented by the Maximal Template.

The current implementation is the baseline. This document does not authorize changing the application to restore an older anonymous-demo model.

## Identity provider

Clerk owns external authentication and session identity.

The root application installs `ClerkProvider`.

`proxy.ts` installs `clerkMiddleware()` for the configured matcher. It does not currently use route matching to define the tenant authorization policy.

Application access decisions are made inside application boundaries rather than being delegated entirely to the proxy.

## Application identity and tenancy

The application database owns local product identity and tenancy.

Core entities include:

- `User`;
- `Organization`;
- `Membership`.

A Clerk identity is mapped to the local application identity.

Product roles, membership state, organization relationships, and domain-resource relationships are application data.

Clerk does not replace the local tenancy model.

## Public access

The application has genuinely public surfaces.

Current examples include:

- `/`;
- `/faq`;
- `/privacy`;
- `/terms`;
- `/sign-in`;
- `/sign-up`.

Public access does not imply tenant access or mutation authority.

## Tenant access

Tenant routes live under `app/(tenant)/`.

The current tenant layout is an authentication and onboarding gate.

Before rendering a tenant surface it:

1. calls `getIdentity()`;
2. redirects to sign-in when no application identity is available;
3. calls `getOnboardingState()`;
4. redirects to `/onboarding` when onboarding is incomplete;
5. renders `TenantShell` only after both conditions are satisfied.

Therefore:

```text
tenant access = authenticated identity + completed onboarding
```

The old rule that signed-out visitors can browse tenant recipe surfaces is superseded.

Do not make tenant routes anonymous merely to create a public demo.

## Onboarding

Onboarding is a real setup boundary under `app/(setup)/onboarding`.

It is part of tenant admission rather than an optional public showcase.

Tenant routes may assume the tenant layout has completed the top-level identity/onboarding gate, but resource-specific authorization still belongs at the relevant server boundary.

## Sign-in and sign-up

Custom auth features live under:

```text
features/auth/
```

The current sign-in and sign-up features use Clerk client APIs and React Hook Form.

They may compose both:

```text
components/blocks/auth-forms.tsx
components/ui/*
```

The auth block provides reusable presentation and local/demo behavior. The feature owns the real Clerk flow and RHF-controlled application behavior.

Do not move Clerk workflow state into generic presentation components.

## Server authentication

Server identity behavior lives under:

```text
lib/auth/
```

Current responsibilities include:

- resolving application identity;
- Clerk integration helpers;
- redirects;
- Clerk webhook interpretation.

Authentication answers who the user is.

It does not by itself answer whether the user may perform a domain operation.

## Authorization

Application authorization lives under:

```text
lib/authz/
```

Current modules include:

- permissions;
- policies;
- resources;
- roles.

Authorization may use:

- membership status;
- product role;
- capability/permission;
- tenant scope;
- resource relationships;
- operation-specific policy.

Do not rely on hidden UI controls as authorization enforcement.

## Persistence scope and RLS

Application persistence is organization-aware.

Where RLS or equivalent database containment exists, it is defense in depth and must be evaluated at the database boundary.

RLS does not replace application authorization.

Conversely, application authorization does not prove that an RLS policy is correct.

Claims about cross-tenant containment require direct evidence appropriate to that boundary.

## Clerk webhook boundary

Clerk webhook HTTP handling lives under:

```text
app/api/clerk/
```

Clerk-specific interpretation helpers live under `lib/auth`.

Reusable atomic database behavior belongs in the existing database transaction boundary.

Webhook requests must be verified before their payload is trusted.

The configured signing-secret name is:

```text
CLERK_WEBHOOK_SIGNING_SECRET
```

The current development webhook configuration tracks the user lifecycle events required by the implemented synchronization flow.

Do not broaden provider subscriptions or perform live provider changes without explicit owner instruction.

## Environment variables

Current authentication-related environment names are:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET
DATABASE_URL
DIRECT_DATABASE_URL
```

`.env.example` documents names only and must not contain credentials.

## Security invariants

The following are implementation invariants unless the owner explicitly changes them:

- tenant routes require an authenticated application identity;
- tenant routes require completed onboarding;
- resource-level authz remains necessary after the tenant-layout gate;
- local membership/product state remains application-owned;
- provider identity is not a substitute for application authorization;
- secrets stay server-side;
- webhook authenticity is verified before trust;
- UI visibility is never treated as proof of permission;
- RLS claims require database-level evidence;
- live provider or destructive database changes require explicit owner authorization.
