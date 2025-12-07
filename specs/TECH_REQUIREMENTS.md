# FleetFusion Technical Requirements

**Version:** 3.0 (Aligned with Repository Tree)
**Status:** Authoritative
**Scope:** Full Stack

## 1. Core Technology Stack

| Component     | Technology   | Version | Implementation Note                                  |
| :------------ | :----------- | :------ | :--------------------------------------------------- |
| **Framework** | Next.js      | 16.x    | App Router, Server Actions, RSC-first                |
| **Language**  | TypeScript   | 5.x     | Strict mode, Path aliases (`@/*`)                    |
| **Styling**   | Tailwind CSS | 4.x     | CSS-first config (`global.css`), `@theme` directives |
| **Database**  | PostgreSQL   | 16.x    | Neon Serverless (Branching enabled)                  |
| **ORM**       | Prisma       | 7.x     | Schema at `prisma/schema.prisma`                     |
| **Auth**      | Clerk        | 6.x     | Middleware gating, RBAC via metadata                 |
| **Testing**   | Vitest       | 2.x     | Unit/Integration (`src/**/*.test.ts`)                |
| **E2E**       | Playwright   | 1.x     | End-to-end flows (`e2e/`)                            |

## 2. Application Architecture

### 2.1 Domain-Driven Modular Monolith

The application is structured as a modular monolith where each business domain exists as a top-level route in `src/app/`.

**Domain List:**

- `auth` (Authentication & Onboarding)
- `dashboard` (Operational Overview)
- `vehicles` (Fleet Assets)
- `drivers` (Personnel & Compliance)
- `dispatch` (Load Management)
- `compliance` (Document Tracking)
- `ifta` (Fuel & Tax Reporting)
- `analytics` (Reporting Engine)
- `settings` (Org Configuration)
- `notifications` (Alert Routing)
- `admin` (System Management)

### 2.2 Data Access Layer

- **Fetchers (`*Fetchers.ts`):** Pure server-side functions for data retrieval. Must return typed objects (DTOs). Never called from Client Components.
- **Actions (`*Actions.ts`):** React Server Actions for mutations. Must validate inputs via Zod schemas and enforce RBAC.
- **Direct DB Access:** Only allowed in Fetchers and Actions. No API routes for CRUD.

### 2.3 Authentication & Authorization

- **Provider:** Clerk (User Management).
- **RBAC:** Custom role matrix defined in `src/lib/server/rbac.ts`.
- **Context:** `requireOrgContext` middleware/helper in `src/lib/server/auth.ts` ensures tenant isolation.

## 3. File System Conventions

### 3.1 Domain Module Structure

Every domain in `src/app/[domain]` MUST adhere to:

```text
src/app/[domain]/
├── types/          # Domain-specific TypeScript interfaces
├── schemas/        # Zod schemas for validation (*.schema.ts)
├── lib/            # Business logic
│   ├── [domain]Actions.ts    # Server Actions (Mutations)
│   ├── [domain]Fetchers.ts   # Data Fetchers (Queries)
│   ├── [domain]Hooks.ts      # Client-side Hooks
│   └── [domain]Validation.ts # Shared validation logic
├── components/     # Domain-specific UI components
├── tests/          # Vitest suites (*.test.ts)
├── styles/         # CSS Modules (if needed)
├── layout.tsx      # Domain layout
└── page.tsx        # Main entry point
```

### 3.2 Shared Libraries (`src/lib`)

- **`server/`**: Auth, RBAC, Cache, Uploads.
- **`observability/`**: Logger, Metrics, Tracing.
- **`files/`**: File validation and storage adapters.
- **`pdf/` & `excel/`**: Document generation engines.

## 4. Quality Assurance

- **Unit Tests:** Co-located in `tests/` folder within each domain.
- **Coverage:** Minimum 80% coverage on Actions and Fetchers.
- **CI/CD:** GitHub Actions pipeline (`.github/workflows/ci.yml`) runs lint, build, and test.
