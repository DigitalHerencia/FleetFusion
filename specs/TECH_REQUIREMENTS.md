# FleetFusion Technical Requirements

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft  
**Author:** FleetFusion Engineering Team

---

## Executive Summary

This document defines the technical requirements for the FleetFusion platform rebuild, including the technology stack, architecture patterns, development standards, and infrastructure requirements.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Architecture Patterns](#2-architecture-patterns)
3. [Development Standards](#3-development-standards)
4. [Infrastructure Requirements](#4-infrastructure-requirements)
5. [Integration Requirements](#5-integration-requirements)
6. [Testing Strategy](#6-testing-strategy)
7. [Deployment Pipeline](#7-deployment-pipeline)

---

## 1. Technology Stack

### 1.1 Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework with App Router, RSC, Server Actions |
| **React** | 19.x | UI library with concurrent rendering |
| **TypeScript** | 5.x | Type-safe JavaScript superset |

### 1.2 Database & ORM

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16.x | Primary relational database |
| **Neon** | Serverless | Cloud PostgreSQL with branching |
| **Prisma** | 7.x | Type-safe ORM with migrations |
| **@neondatabase/serverless** | 1.x | Neon driver for edge compatibility |

### 1.3 Authentication & Authorization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Clerk** | 6.x | Authentication provider |
| **@clerk/nextjs** | 6.x | Next.js Clerk SDK |
| **Svix** | 1.x | Webhook verification |
| **Custom RBAC** | - | Prisma-based roles and permissions |

### 1.4 Styling & UI

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **tailwindcss-animate** | latest | Animation utilities |
| **@tailwindcss/typography** | latest | Prose styling |
| **shadcn/ui** | latest | Radix-based component library |
| **Radix UI** | latest | Headless UI primitives |
| **Lucide React** | latest | Icon library |
| **Framer Motion** | latest | Animation library |

### 1.5 Forms & Validation

| Technology | Version | Purpose |
|------------|---------|---------|
| **Zod** | 4.x | Schema validation |
| **React Hook Form** | latest | Form state management |
| **@hookform/resolvers** | latest | Zod integration for RHF |

### 1.6 Data Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | latest | React charting library |
| **@tanstack/react-table** | latest | Data table with sorting, filtering |

### 1.7 File Handling & Documents

| Technology | Version | Purpose |
|------------|---------|---------|
| **@vercel/blob** | latest | File storage |
| **@react-pdf/renderer** | latest | PDF generation |
| **pdf-lib** | latest | PDF manipulation |
| **ExcelJS** | latest | Excel generation |

### 1.8 Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.x | Code linting |
| **Prettier** | 3.x | Code formatting |
| **PostCSS** | 8.x | CSS processing |
| **Husky** | latest | Git hooks |
| **lint-staged** | latest | Pre-commit linting |

### 1.9 Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 3.x | Unit and integration testing |
| **Playwright** | 1.x | End-to-end testing |
| **@testing-library/react** | latest | React component testing |
| **MSW** | latest | API mocking |

### 1.10 Monitoring & Observability

| Technology | Version | Purpose |
|------------|---------|---------|
| **Sentry** | latest | Error tracking |
| **Vercel Analytics** | latest | Performance analytics |
| **OpenTelemetry** | latest | Distributed tracing |
| **Pino** | latest | Structured logging |

### 1.11 Rate Limiting & Caching

| Technology | Version | Purpose |
|------------|---------|---------|
| **Upstash Redis** | latest | Rate limiting, caching |
| **@upstash/ratelimit** | latest | Rate limit library |

---

## 2. Architecture Patterns

### 2.1 Server-First Rendering

```
┌─────────────────────────────────────────────────────────────┐
│                     Request Flow                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Browser ──▶ Next.js Edge ──▶ React Server Component        │
│                                        │                     │
│                                        ▼                     │
│                              ┌─────────────────┐             │
│                              │  Data Fetching  │             │
│                              │   (Prisma/API)  │             │
│                              └────────┬────────┘             │
│                                       │                      │
│                                       ▼                      │
│                              ┌─────────────────┐             │
│                              │  Render HTML    │             │
│                              │  (Server-side)  │             │
│                              └────────┬────────┘             │
│                                       │                      │
│                                       ▼                      │
│  Browser ◀──────── Streamed HTML + React Hydration          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Principles:**
- Default to React Server Components (RSC)
- Use `"use client"` only for interactive components
- Fetch data in server components, not useEffect
- Stream data with Suspense for loading states

### 2.2 Server Actions for Mutations

```typescript
// lib/actions/dispatch/create-load.action.ts
'use server';

import { z } from 'zod';
import { createLoadSchema } from '@/schemas/dispatch';
import { prisma } from '@/lib/database/client';
import { getCurrentUser } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function createLoadAction(data: z.infer<typeof createLoadSchema>) {
  // 1. Authenticate
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  // 2. Authorize
  if (!user.can('dispatch:loads:create')) {
    throw new Error('Forbidden');
  }

  // 3. Validate
  const validated = createLoadSchema.parse(data);

  // 4. Execute business logic
  const load = await prisma.load.create({
    data: {
      ...validated,
      organizationId: user.organizationId,
      createdById: user.id,
    },
  });

  // 5. Revalidate cache
  revalidatePath(`/${user.organizationId}/dispatch`);

  // 6. Return result
  return { success: true, load };
}
```

**Pattern:**
1. Authenticate user (Clerk session)
2. Authorize action (RBAC check)
3. Validate input (Zod schema)
4. Execute business logic (Prisma transaction)
5. Revalidate cache (Next.js ISR)
6. Return result (type-safe response)

### 2.3 Domain-Driven Design Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (marketing)/              # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/
│   │   └── layout.tsx
│   └── (tenant)/                 # Protected tenant routes
│       └── [orgId]/
│           ├── dashboard/
│           ├── dispatch/
│           ├── vehicles/
│           ├── drivers/
│           ├── compliance/
│           ├── ifta/
│           ├── analytics/
│           ├── settings/
│           └── layout.tsx
│
├── domains/                      # Domain modules
│   ├── auth/
│   │   ├── actions/              # Server actions
│   │   ├── components/           # Domain-specific UI
│   │   ├── hooks/                # Client hooks
│   │   ├── lib/                  # Domain logic
│   │   ├── schemas/              # Zod schemas
│   │   └── types/                # Domain types
│   ├── dispatch/
│   ├── vehicles/
│   ├── drivers/
│   ├── compliance/
│   ├── ifta/
│   ├── analytics/
│   └── settings/
│
├── shared/                       # Shared code
│   ├── components/               # Pure UI components (shadcn)
│   │   ├── ui/                   # shadcn/ui components
│   │   └── common/               # App-wide components
│   ├── hooks/                    # Shared React hooks
│   ├── lib/                      # Shared utilities
│   │   ├── auth/                 # Auth utilities
│   │   ├── database/             # Prisma client
│   │   ├── utils/                # Helper functions
│   │   └── errors/               # Error handling
│   ├── types/                    # Shared types
│   └── schemas/                  # Shared schemas
│
├── infrastructure/               # Infrastructure code
│   ├── api/                      # API route handlers
│   ├── webhooks/                 # Webhook handlers
│   ├── jobs/                     # Background jobs
│   └── middleware/               # Edge middleware
│
├── prisma/                       # Database
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── tests/                        # Test suites
    ├── unit/                     # Vitest unit tests
    ├── integration/              # Vitest integration tests
    ├── e2e/                      # Playwright E2E tests
    └── fixtures/                 # Test data
```

### 2.4 Multi-Tenant Data Isolation

```typescript
// Every database query MUST include organizationId filter

// ✅ Correct - Tenant-scoped query
async function getLoads(organizationId: string) {
  return prisma.load.findMany({
    where: { organizationId },
  });
}

// ✅ Correct - Using Prisma middleware for automatic scoping
prisma.$use(async (params, next) => {
  const context = getRequestContext();
  if (context?.organizationId && params.model !== 'Organization') {
    params.args.where = {
      ...params.args.where,
      organizationId: context.organizationId,
    };
  }
  return next(params);
});

// ❌ Wrong - Unscoped query (security vulnerability)
async function getLoads() {
  return prisma.load.findMany(); // Exposes all tenant data!
}
```

### 2.5 Custom RBAC (No Clerk Organizations)

```typescript
// Database-driven role-based access control

// Organization with subscription
model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  subscriptionTier  SubscriptionTier @default(starter)
  subscriptionStatus SubscriptionStatus @default(trial)
  
  memberships       OrganizationMembership[]
  // ... other relations
}

// User-to-organization mapping with role
model OrganizationMembership {
  id              String       @id @default(cuid())
  userId          String
  organizationId  String
  role            UserRole     @default(member)
  
  user            User         @relation(fields: [userId])
  organization    Organization @relation(fields: [organizationId])
  
  @@unique([userId, organizationId])
}

// Permission check utility
async function checkPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  const membership = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
    include: { organization: true },
  });
  
  if (!membership) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[membership.role];
  return rolePermissions.includes(permission);
}
```

---

## 3. Development Standards

### 3.1 TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"],
      "@/domains/*": ["./src/domains/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### 3.2 ESLint Configuration

```javascript
// eslint.config.js (ESLint 9 flat config)
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      '@next/next': nextPlugin,
      'react': reactPlugin,
      'react-hooks': hooksPlugin,
    },
    rules: {
      // Enforce explicit return types
      '@typescript-eslint/explicit-function-return-type': 'error',
      // No any
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce exhaustive deps
      'react-hooks/exhaustive-deps': 'error',
      // No console.log in production
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  }
);
```

### 3.3 Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 3.4 Git Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Scopes:**
- `auth`, `dispatch`, `vehicles`, `drivers`, `compliance`, `ifta`, `analytics`, `settings`
- `ui`, `api`, `db`, `infra`, `ci`

**Example:**
```
feat(dispatch): add drag-and-drop load board

Implements Kanban-style dispatch board with:
- Drag-and-drop load status updates
- Real-time SSE sync
- Optimistic UI updates

Closes #123
```

### 3.5 Code Organization Rules

**File Naming:**
- Components: `PascalCase.tsx` (e.g., `LoadCard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-load-status.ts`)
- Actions: `kebab-case.action.ts` (e.g., `create-load.action.ts`)
- Schemas: `kebab-case.schema.ts` (e.g., `load.schema.ts`)
- Types: `kebab-case.types.ts` (e.g., `load.types.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Shared imports (`@/shared/*`)
4. Domain imports (`@/domains/*`)
5. Relative imports

```typescript
// ✅ Correct import order
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { prisma } from '@/shared/lib/database/client';
import { createLoadAction } from '@/domains/dispatch/actions';
import { LoadForm } from './LoadForm';
```

---

## 4. Infrastructure Requirements

### 4.1 Hosting (Vercel)

| Resource | Configuration |
|----------|---------------|
| **Framework** | Next.js 16 |
| **Region** | US East (iad1) primary |
| **Functions** | Node.js 20 runtime |
| **Edge Functions** | Middleware, auth checks |
| **Build** | Turbopack |
| **Analytics** | Vercel Analytics + Speed Insights |

### 4.2 Database (Neon)

| Resource | Configuration |
|----------|---------------|
| **Provider** | Neon Serverless PostgreSQL |
| **Version** | PostgreSQL 16 |
| **Compute** | Auto-scaling (0.25 - 4 CU) |
| **Storage** | Auto-scaling |
| **Branching** | Dev/staging branches per PR |
| **Connection** | Pooled via @neondatabase/serverless |

### 4.3 Authentication (Clerk)

| Resource | Configuration |
|----------|---------------|
| **Provider** | Clerk |
| **Features** | Email/password, social OAuth, MFA |
| **Webhooks** | User sync to database |
| **Custom Claims** | organizationId, role |
| **Session Duration** | 7 days |

### 4.4 File Storage (Vercel Blob)

| Resource | Configuration |
|----------|---------------|
| **Provider** | Vercel Blob |
| **Use Cases** | Documents, images, POD files |
| **Max Size** | 500MB per file |
| **CDN** | Vercel Edge Network |

### 4.5 Rate Limiting (Upstash)

| Resource | Configuration |
|----------|---------------|
| **Provider** | Upstash Redis |
| **Limits** | 100 req/min per user (default) |
| **Algorithms** | Sliding window |
| **Bypass** | Enterprise tier |

### 4.6 Monitoring

| Service | Purpose |
|---------|---------|
| **Sentry** | Error tracking, performance |
| **Vercel Analytics** | Web vitals, usage |
| **Axiom** | Log aggregation |
| **BetterStack** | Uptime monitoring |

---

## 5. Integration Requirements

### 5.1 Clerk Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/database/client';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  
  // Verify webhook signature
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Process event with Prisma transaction
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { clerkId: id },
        update: {
          email: email_addresses[0]?.email_address,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
        create: {
          clerkId: id,
          email: email_addresses[0]?.email_address!,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
      });
      
      await tx.webhookEvent.create({
        data: {
          type: eventType,
          clerkId: id,
          payload: evt.data,
          processedAt: new Date(),
        },
      });
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { clerkId: id },
        data: { deletedAt: new Date() },
      });
      
      await tx.webhookEvent.create({
        data: {
          type: eventType,
          clerkId: id!,
          payload: evt.data,
          processedAt: new Date(),
        },
      });
    });
  }

  return new Response('OK', { status: 200 });
}
```

### 5.2 Stripe Integration (Future)

```typescript
// Payment and subscription management
interface StripeIntegration {
  // Checkout
  createCheckoutSession(orgId: string, tier: SubscriptionTier): Promise<string>;
  
  // Portal
  createBillingPortalSession(orgId: string): Promise<string>;
  
  // Webhooks
  handleSubscriptionUpdated(event: Stripe.Event): Promise<void>;
  handlePaymentFailed(event: Stripe.Event): Promise<void>;
  handleSubscriptionCancelled(event: Stripe.Event): Promise<void>;
}
```

### 5.3 Email Integration

```typescript
// Transactional emails
interface EmailService {
  // User lifecycle
  sendWelcomeEmail(user: User): Promise<void>;
  sendInvitationEmail(invitation: Invitation): Promise<void>;
  sendPasswordResetEmail(user: User, token: string): Promise<void>;
  
  // Alerts
  sendComplianceAlert(alert: ComplianceAlert): Promise<void>;
  sendExpirationReminder(document: Document): Promise<void>;
  
  // Reports
  sendScheduledReport(report: Report): Promise<void>;
}
```

---

## 6. Testing Strategy

### 6.1 Test Pyramid

```
                    ┌───────────┐
                    │   E2E     │  10% - Critical user journeys
                    │(Playwright)│
                 ┌──┴───────────┴──┐
                 │  Integration    │  30% - API and database
                 │   (Vitest)      │
              ┌──┴─────────────────┴──┐
              │      Unit Tests       │  60% - Functions, hooks
              │      (Vitest)         │
              └───────────────────────┘
```

### 6.2 Unit Tests (Vitest)

```typescript
// domains/dispatch/lib/__tests__/load-status.test.ts
import { describe, it, expect } from 'vitest';
import { canTransitionStatus, getNextStatuses } from '../load-status';

describe('canTransitionStatus', () => {
  it('should allow pending → assigned transition', () => {
    expect(canTransitionStatus('pending', 'assigned')).toBe(true);
  });

  it('should not allow delivered → pending transition', () => {
    expect(canTransitionStatus('delivered', 'pending')).toBe(false);
  });
});

describe('getNextStatuses', () => {
  it('should return valid next statuses for in_transit', () => {
    const nextStatuses = getNextStatuses('in_transit');
    expect(nextStatuses).toContain('at_delivery');
    expect(nextStatuses).toContain('delivered');
    expect(nextStatuses).not.toContain('pending');
  });
});
```

### 6.3 Integration Tests (Vitest)

```typescript
// tests/integration/dispatch/create-load.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/shared/lib/database/client';
import { createLoadAction } from '@/domains/dispatch/actions';
import { createTestOrg, createTestUser } from '@/tests/fixtures';

describe('createLoadAction', () => {
  let org: Organization;
  let user: User;

  beforeAll(async () => {
    org = await createTestOrg();
    user = await createTestUser({ organizationId: org.id, role: 'dispatcher' });
  });

  afterAll(async () => {
    await prisma.load.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  });

  it('should create a load with valid data', async () => {
    const result = await createLoadAction({
      customerId: 'cust_123',
      originCity: 'Chicago',
      originState: 'IL',
      destinationCity: 'Detroit',
      destinationState: 'MI',
      pickupDate: new Date(),
      deliveryDate: new Date(Date.now() + 86400000),
      rate: 2500,
    });

    expect(result.success).toBe(true);
    expect(result.load.status).toBe('pending');
  });
});
```

### 6.4 E2E Tests (Playwright)

```typescript
// tests/e2e/dispatch/create-load.spec.ts
import { test, expect } from '@playwright/test';
import { signIn, createOrg } from '@/tests/e2e/helpers';

test.describe('Dispatch - Create Load', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, { role: 'dispatcher' });
  });

  test('should create a new load from the dispatch board', async ({ page }) => {
    await page.goto('/org_123/dispatch');
    
    // Click "New Load" button
    await page.getByRole('button', { name: 'New Load' }).click();
    
    // Fill form
    await page.getByLabel('Customer').fill('ACME Logistics');
    await page.getByLabel('Origin City').fill('Chicago');
    await page.getByLabel('Origin State').selectOption('IL');
    await page.getByLabel('Destination City').fill('Detroit');
    await page.getByLabel('Destination State').selectOption('MI');
    await page.getByLabel('Rate').fill('2500');
    
    // Submit
    await page.getByRole('button', { name: 'Create Load' }).click();
    
    // Verify
    await expect(page.getByText('Load created successfully')).toBeVisible();
    await expect(page.getByText('ACME Logistics')).toBeVisible();
  });
});
```

### 6.5 Coverage Requirements

| Category | Target | Enforcement |
|----------|--------|-------------|
| Unit Tests | > 80% | CI gate |
| Integration Tests | > 60% | CI gate |
| E2E Tests | Critical paths | CI gate |
| Mutation Testing | > 70% | Quarterly |

---

## 7. Deployment Pipeline

### 7.1 CI/CD Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │  Push   │───▶│  Lint   │───▶│  Type   │───▶│  Unit   │      │
│  │ to PR   │    │ (ESLint)│    │  Check  │    │  Tests  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│                                                    │             │
│                                                    ▼             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ Deploy  │◀───│  E2E    │◀───│  Build  │◀───│  Int.   │      │
│  │ Preview │    │  Tests  │    │ (Vercel)│    │  Tests  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PR Review                             │    │
│  │  • Code review    • Preview URL    • Test report        │    │
│  └─────────────────────────────────────────────────────────┘    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                      │
│  │  Merge  │───▶│  Deploy │───▶│  Smoke  │───▶ Production       │
│  │ to main │    │ Staging │    │  Tests  │                      │
│  └─────────┘    └─────────┘    └─────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 7.3 Environment Configuration

| Environment | Branch | Database | Purpose |
|-------------|--------|----------|---------|
| Development | feature/* | Neon branch | Developer testing |
| Preview | PR | Neon branch | PR review |
| Staging | main | Neon staging | Pre-production |
| Production | release/* | Neon main | Live traffic |

### 7.4 Feature Flags

```typescript
// Feature flag configuration
const featureFlags = {
  // Release flags
  NEW_DISPATCH_BOARD: process.env.FF_NEW_DISPATCH_BOARD === 'true',
  IFTA_V2: process.env.FF_IFTA_V2 === 'true',
  
  // Ops flags
  MAINTENANCE_MODE: process.env.FF_MAINTENANCE_MODE === 'true',
  READ_ONLY_MODE: process.env.FF_READ_ONLY_MODE === 'true',
  
  // Experiment flags
  AI_LOAD_SUGGESTIONS: process.env.FF_AI_LOAD_SUGGESTIONS === 'true',
};
```

---

## Appendix A: Dependency Matrix

| Dependency | Min Version | Peer Dependencies |
|------------|-------------|-------------------|
| next | 16.0.0 | react@19, react-dom@19 |
| @clerk/nextjs | 6.0.0 | next@15+ |
| prisma | 7.0.0 | @prisma/client@7 |
| tailwindcss | 4.0.0 | postcss@8 |
| zod | 4.0.0 | - |
| vitest | 3.0.0 | - |
| playwright | 1.40.0 | - |

---

## Appendix B: Security Checklist

- [ ] All API routes validate authentication
- [ ] All mutations check authorization
- [ ] Input validation on all user input
- [ ] CSRF protection enabled
- [ ] Rate limiting on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React)
- [ ] Secrets in environment variables
- [ ] Webhook signatures verified
- [ ] Audit logging for sensitive actions

---

## Related Documents

- [PRD.md](./PRD.md) - Product requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security specification
- [DATA_MODELING.md](./DATA_MODELING.md) - Database schema
