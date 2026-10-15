# Architecture — The Maximal Template™

## Purpose

This document describes the architecture that exists in the Maximal Template.

It is descriptive governance for the current codebase. It must not be used to force the implementation into an older or more theoretically tidy structure.

When this document and the implementation disagree, inspect the implementation and ask the owner before changing product semantics or architecture.

## Application topology

The application is one Next.js App Router application.

Current route organization is:

```text
app/
├── page.tsx
├── (public)/
├── (auth)/
├── (setup)/
├── (tenant)/
└── api/
```

### Root public route

`app/page.tsx` owns `/`.

It uses `PublicShell` and the landing-page template directly.

The root route is intentionally not required to live inside `(public)`.

### Public route group

`app/(public)/` currently owns public informational routes that share the public layout, including:

- `/faq`;
- `/privacy`;
- `/terms`.

A route does not need to be moved into `(public)` merely for conceptual symmetry.

### Authentication routes

`app/(auth)/` owns:

- `/sign-in`;
- `/sign-up`.

### Setup routes

`app/(setup)/` owns setup flows, currently including:

- `/onboarding`.

### Tenant routes

`app/(tenant)/` owns authenticated application surfaces.

Current top-level tenant surfaces include:

- `/dashboard`;
- `/crm`;
- `/projects`;
- `/support`;
- `/marketing`;
- `/invoices`;
- `/expenses`;
- `/social`;
- `/ai`;
- `/portal`;
- `/admin`;
- `/settings`;
- `/my-tasks`.

The business concept may be named `invoicing` in code organization while its current URLs are `/invoices` and `/expenses`.

Do not invent a `/invoicing` route solely to make route names match a domain label.

### API routes

`app/api/` owns HTTP Route Handlers.

Current provider/application families include:

- `ai`;
- `clerk`;
- `sendgrid`;
- `stripe`.

HTTP lifecycle concerns remain in Route Handlers even when reusable provider or persistence helpers live elsewhere.

## Route responsibility

Route files and layouts own framework behavior such as:

- URL topology;
- route groups and dynamic segments;
- layouts;
- metadata;
- params and search-param adaptation;
- Suspense placement;
- loading/error/not-found behavior;
- redirects;
- HTTP request/response boundaries.

Application pages should remain thin when a feature already owns the corresponding orchestration.

The current CRM list route is representative:

```text
app page
  → server feature
  → workflow/data
  → presentation template
```

Static public pages may also render a presentation template directly without creating a feature wrapper.

## Presentation architecture

The implemented presentation system has multiple distinct layers.

### `components/ui`

Reusable controls, primitives, and low-level UI infrastructure.

Examples include buttons, inputs, dialogs, tables, navigation primitives, charts, motion helpers, and form controls.

### `components/blocks`

Reusable composed UI.

Blocks may:

- compose primitives;
- expose typed props and slots;
- own local presentation state;
- own local demo interaction when appropriate;
- provide reusable form-shaped presentation.

Blocks must not become an alternate application-service layer.

Application database access, server authorization policy, provider account truth, and cross-domain business orchestration remain outside blocks.

`components/blocks/auth-forms.tsx` is an intentional example: it can render a self-contained local form variation, while the real Clerk/RHF auth feature can inject controlled form content.

### `components/templates`

Page- and surface-level presentation compositions.

This is a first-class layer in the current codebase.

Templates include public, CRM, projects, support, marketing, invoicing, social, AI, portal, admin, shared, and settings-oriented compositions.

Templates receive data and callbacks from the surrounding feature or route and define the presentation structure for a complete surface.

### `features`

Feature modules own application-facing orchestration and behavior for a surface.

A feature may:

- call a workflow or fetcher;
- adapt server data for presentation;
- compose a template;
- own client-only interaction;
- use React Hook Form;
- integrate an approved client provider API such as Clerk where that behavior belongs to the feature.

Client companions use the `.client.tsx` suffix where the browser boundary is meaningful.

### Shell, navigation, brand, and chart families

The repository also contains dedicated presentation families:

```text
components/shells/
components/nav/
components/brand/
components/chart/
```

These are real architectural categories and should remain explicit rather than being forced into `ui`, `blocks`, or `features`.

## Common presentation flows

There is no single mandatory import chain.

Current valid patterns include:

```text
app → feature → template → blocks/ui
app → template → blocks/ui
feature → template
feature → block
feature → ui
template → blocks/ui
block → ui
```

The important boundary is responsibility, not artificial layer traversal.

## Server application libraries

### `lib/fetchers`

Read-oriented application data access.

The repository currently groups fetchers by useful responsibility, including CRM, projects, support, marketing, invoicing, AI, portal, admin, onboarding, organization, integration, and social concerns.

### `lib/actions`

Application mutations and mutation entrypoints.

The repository currently groups actions by useful responsibility, including CRM, projects, support, marketing, invoicing, AI, portal, admin, onboarding, social, and common behavior.

Actions are not the only possible write boundary: webhook processing and reusable transaction helpers have their own explicit boundaries.

### `lib/workflows`

Business and application orchestration that coordinates lower-level operations.

Workflows may combine fetchers, actions, calculations, and domain rules.

For example, CRM workflows compose CRM fetchers and actions rather than duplicating their persistence mechanics.

### `lib/db`

Database runtime and reusable persistence mechanics.

The current structure includes:

```text
lib/db/
├── client.ts
├── provider.ts
├── tenant.ts
├── selects/
├── dto/
└── transactions/
```

Do not remove an existing database helper merely because a smaller conceptual diagram omitted it.

### `lib/auth`

Clerk-facing authentication and identity behavior.

### `lib/authz`

Application authorization behavior, including roles, permissions, resources, and policies.

### `lib/integrations`

External-provider adapters and status behavior.

Current integration families include:

- Stripe;
- Vercel Blob;
- Cloudinary;
- SendGrid;
- Hugging Face.

Clerk remains under `lib/auth`. Prisma/Neon runtime behavior remains under `lib/db` and root Prisma lifecycle remains under `prisma/`.

## Schemas and types

`schemas/` contains runtime validation contracts organized by useful responsibility.

`types/` contains shared TypeScript contracts, including domain, access, integration, UI, and common types.

The current filenames are authoritative evidence of the organization that exists. Do not create or rename files merely to produce perfect domain symmetry.

## Persistence and tenancy

Prisma owns the application persistence model.

The application database contains local tenancy and product state, including:

- `User`;
- `Organization`;
- `Membership`;
- domain entities for CRM, projects, support, marketing, invoicing, social, AI, portal, billing, assets, audit, webhook, and idempotency concerns.

Tenant-aware application behavior is enforced through application identity, membership/resource policy, scoped persistence behavior, and database protections where implemented.

Do not treat UI visibility as proof of authorization or RLS behavior.

## Authentication boundary

`proxy.ts` installs Clerk middleware for matched requests.

Tenant access is enforced by `app/(tenant)/layout.tsx`, which:

1. resolves application identity;
2. redirects an unauthenticated visitor to sign-in;
3. checks onboarding state;
4. redirects incomplete setup to `/onboarding`;
5. renders `TenantShell` only after those gates pass.

Route-level authentication does not replace resource-level authorization.

## Design architecture

`app/globals.css` is the canonical Tailwind v4 theme and shared style layer.

`app/layout.tsx` installs the root fonts, dark document defaults, metadata, and `ClerkProvider`.

The visual system is intentionally dark-only and uses the current semantic CSS/token system described in `context/docs/design.md`.

## Governing rule

Governance describes the implementation that the owner has accepted.

Do not refactor the codebase solely because an older governance file, generic doctrine, naming convention, or architecture diagram describes a different structure.

If implementation intent is unclear, ask the owner.

## Domain workflow delivery boundaries

Domain templates receive explicit domain DTOs instead of reflecting arbitrary records into generic Name/State/Owner/Updated cells. Feature client companions exist only where there is actual interaction. Server form entrypoints load persisted edit values before rendering client forms.

File upload uses `lib/workflows/assetWorkflows.ts` to authorize, upload through the private storage adapter, persist asset metadata, and attempt cleanup when persistence fails. Uploads are limited to 750 KB by this form transport. Authorized downloads are limited to 10 MB and do not expose storage credentials. A configured environment variable is not evidence of provider connectivity.

Social approval/scheduling and marketing lifecycle changes represent persisted planning state; they do not establish successful external publication or delivery. Invoice issuance opens an approved draft locally and does not charge or email a customer. Do not claim these external effects from local state transitions.
