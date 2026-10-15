# Technical Requirements — The Maximal Template™

## Purpose

This document records technical requirements that match the current Maximal Template implementation.

`package.json`, the lockfile, framework configuration, and source code remain authoritative for exact installed versions and executable scripts.

## Runtime and framework baseline

The template currently uses:

- Next.js App Router;
- React 19;
- React Server Components by default;
- TypeScript;
- pnpm;
- Tailwind CSS 4;
- shadcn/Radix-style UI primitives;
- React Hook Form;
- Zod;
- Prisma 7;
- Neon PostgreSQL;
- Clerk;
- Stripe;
- Vercel deployment tooling and provider integrations.

Do not duplicate exact dependency versions into this document when `package.json` already owns them.

## Route organization

Current application route categories are:

```text
app/page.tsx      → root landing page
app/(public)      → public informational routes
app/(auth)        → sign-in/sign-up
app/(setup)       → onboarding/setup
app/(tenant)      → authenticated application
app/api           → HTTP Route Handlers
```

Do not assume every public route lives under `(public)`.

Do not assume a conceptual business-domain name is also a URL segment.

Current tenant URLs include `/invoices` and `/expenses`; there is no requirement for a `/invoicing` URL merely because the code organization uses an invoicing domain.

## Server/client model

Server Components are the default where the surface does not require browser-only behavior.

Client Components are appropriate for:

- browser APIs;
- local interaction state;
- rich controls;
- client-side filtering/sorting/selection;
- React Hook Form;
- Clerk client flows;
- other browser-only provider behavior.

The `.client.tsx` suffix should identify a meaningful browser boundary.

## Presentation layers

The current presentation families are:

```text
components/ui
components/blocks
components/templates
components/chart
components/brand
components/nav
components/shells
features
```

Responsibilities:

- `ui` — reusable controls and lower-level UI;
- `blocks` — reusable composed UI, including local interactive/demo compositions;
- `templates` — complete page/surface presentation compositions;
- `features` — application behavior, data adaptation, server/client orchestration;
- `shells` and `nav` — application/public structure and navigation;
- `brand` — shared product identity presentation;
- `chart` — chart-specific presentation infrastructure.

No artificial rule requires a feature or route to traverse every layer.

## Thin routes

Tenant route pages should remain thin when an existing feature owns the surface.

A common current pattern is:

```text
route
  → Suspense
  → server feature
  → workflow/fetcher
  → template
  → blocks/ui
```

Static public routes may render templates directly.

## Persistence

Read-oriented application data access lives under:

```text
lib/fetchers/
```

Application mutation entrypoints live under:

```text
lib/actions/
```

Cross-operation/domain orchestration lives under:

```text
lib/workflows/
```

Reusable database mechanics live under:

```text
lib/db/
├── client.ts
├── provider.ts
├── tenant.ts
├── selects/
├── dto/
└── transactions/
```

Root Prisma lifecycle remains under:

```text
prisma/
```

Do not invent a second repository/service architecture unless the owner explicitly changes the implementation.

## Runtime validation and shared types

Runtime validation contracts live under:

```text
schemas/
```

Shared TypeScript contracts live under:

```text
types/
```

The current organization includes domain files plus cross-cutting files such as access, integration, UI, and common contracts.

Do not create or rename files solely for naming symmetry.

## Authentication and authorization

Clerk owns external authentication/session identity.

Application identity and tenancy are local application concerns.

Current tenant admission requires:

- authenticated application identity;
- completed onboarding.

Application authorization remains under:

```text
lib/authz/
```

Authentication does not replace resource-level authorization.

## Provider integration

Provider-specific code currently lives under:

```text
lib/integrations/
├── cloudinary/
├── hugging-face/
├── sendgrid/
├── stripe/
├── vercel-blob/
└── status.ts
```

Exceptions:

```text
Clerk  → lib/auth
Neon   → lib/db
Prisma → lib/db runtime + root prisma lifecycle
```

Current provider HTTP Route Handlers include Clerk, Stripe, SendGrid, and AI API families under `app/api`.

## Environment behavior

`.env.example` must match the environment variable names used by the implementation.

Secrets must remain server-side unless a provider explicitly requires a public publishable value.

Missing optional provider configuration must fail narrowly.

Do not report an unconfigured provider as live.

## Tailwind and design

Tailwind v4 configuration is CSS-first and remains centered in `app/globals.css`.

The current root visual system is dark-only.

Shared semantic surface, typography, navigation, field, and action utilities should be reused.

The sitewide button/control border invariant is 3px.

## Repository-native commands

Run template commands from `template/`.

Current scripts include:

```text
pnpm dev
pnpm build
pnpm format
pnpm format:check
pnpm lint
pnpm lint:fix
pnpm prisma:generate
pnpm prisma:validate
pnpm typecheck
pnpm validate
pnpm start
```

`pnpm validate` currently runs:

```text
pnpm format:check
pnpm lint
pnpm typecheck
```

`pnpm prisma:validate` and `pnpm build` remain separate checks.

Use the narrowest relevant check first.

Never report an unexecuted command as passed.

## Destructive and live operations

Do not perform without explicit owner instruction:

- production deployment;
- destructive database changes;
- irreversible migrations;
- provider account provisioning;
- secret creation or rotation;
- live billing mutation;
- live provider configuration changes.

## Governing rule

Technical requirements conform to the implementation unless the owner explicitly requests an implementation change.

Governance cleanup is not permission to refactor working code.
