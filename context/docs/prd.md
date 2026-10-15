# Product Requirements — The Maximal Template™

## Product

The Maximal Template™ is the maximal runnable application used as the reference implementation and source material for the broader Codependent Coding / Loaded Vibes generation system.

It is one coherent application, not a set of independent starter apps.

Its purpose is to demonstrate and preserve a broad modern application architecture in working form.

## Product objective

The template should make the supported application patterns concrete enough that they can be:

- inspected;
- run;
- reused;
- generated from;
- extended;
- compared;
- validated.

The implementation is the product baseline.

Governance exists to describe and guide that implementation, not to redesign it from stale assumptions.

## Access model

The product has separate public, authentication/setup, and tenant experiences.

### Public

Current public-facing surfaces include:

- the root landing page;
- FAQ;
- privacy;
- terms;
- sign-in;
- sign-up.

These surfaces do not require tenant access.

### Setup

Onboarding is a real setup flow.

### Tenant application

Application recipe surfaces under `(tenant)` require:

- authenticated application identity;
- completed onboarding.

This includes major application areas such as dashboard, CRM, projects, support, marketing, invoicing surfaces, social, AI, portal, admin, settings, and personal-task views.

The product is not currently an anonymous tenant-browser demo.

## Application areas

The current tenant application demonstrates multiple business/application concerns.

### CRM

Includes accounts, contacts, deals/pipeline, analytics, and related workflows.

### Projects

Includes projects, tasks, milestones/timelines, project membership, and related workflow behavior.

### Support

Includes support tickets/inbox, knowledge-base concepts, analytics, and support workflow.

### Marketing

Represents the marketing automation/business domain rather than generic public-site content.

### Invoicing and expenses

The code organization uses invoicing concepts while the current application routes include:

```text
/invoices
/expenses
```

### Social

Includes social account/post scheduling and related workflow concepts.

### AI

Includes generation/playground/usage concepts and provider integration.

### Portal

Includes portal home, documents, approvals, billing-related surfaces, and portal-specific presentation.

### Admin

Uses a real `/admin` URL segment and includes administrative application surfaces.

### Shared application surfaces

The tenant application also includes dashboard, settings, onboarding, integrations/status, and personal-task experiences.

## Presentation system

The product includes a substantial reusable presentation system:

```text
components/ui
components/blocks
components/templates
components/chart
components/brand
components/nav
components/shells
```

Features connect application behavior and data to those presentation layers.

The existence of `components/templates` is intentional and part of the product architecture.

## Application architecture

The product demonstrates:

- Next.js App Router;
- React Server Components;
- explicit client boundaries;
- thin route entrypoints;
- Suspense;
- feature modules;
- workflows;
- fetchers;
- actions;
- Prisma/Neon persistence;
- local tenancy;
- Clerk authentication;
- application authorization;
- provider integrations;
- runtime schemas;
- shared DTO/type boundaries;
- webhooks;
- idempotency;
- provider status surfaces.

## Tenancy and authorization

Clerk owns external identity/session truth.

The application database owns local users, organizations, memberships, product roles, resource relationships, and application state.

Tenant-layout admission does not eliminate resource-specific authorization.

Database containment such as RLS is a separate security boundary and must be evidenced separately.

## External providers

The current integration layer includes:

- Clerk;
- Neon;
- Prisma;
- Stripe;
- Vercel Blob;
- Cloudinary;
- SendGrid;
- Hugging Face.

Provider code may exist without the provider being live or fully configured.

The application must represent missing configuration honestly rather than faking provider success.

## Design requirement

The Maximal Template uses a dark-only, mature neo-brutalist visual system with:

- restrained color;
- strong 3px button/control borders;
- square geometry;
- dense typography;
- hard shadows;
- mechanical motion;
- accessible focus and contrast.

## Non-goals

Governance updates must not:

- move code solely to satisfy old documentation;
- invent missing routes for naming symmetry;
- force every feature through every presentation layer;
- remove an implemented template or block category because a generic architecture omits it;
- make tenant routes anonymous to restore an older public-demo concept;
- perform destructive database or live provider changes without explicit owner instruction.

## Success criteria

The template succeeds when:

- the application remains internally coherent;
- public and tenant access boundaries behave as implemented;
- tenant routes require authentication and completed onboarding;
- major recipe domains remain discoverable after tenant admission;
- presentation layers remain reusable without obscuring responsibility;
- server data/mutation/provider boundaries remain explicit;
- security claims are supported by appropriate evidence;
- optional provider configuration fails narrowly;
- repository-native validation can be executed and reported accurately;
- governance accurately describes the codebase.
