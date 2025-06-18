<!-- @format -->

-   **Developer Docs**: Split into `TECHNICAL_SPEC.md`, `CLERK_MIDDLEWARE_CONFIG.md`, and
    `APPENDIX.md`—with structured sections, tables, and architecture notes.
-   **User Docs**: GitHub-flavored markdown covering QuickStart, FAQ, Troubleshooting, Reference
    Sheets for each role (admin, dispatcher, driver, compliance officer), and module-level guides.

## Document Structure

-   **[Technical Specification](../doc/TECHNICAL_SPEC.md)**: Complete system architecture, database design,
    API reference, and implementation details
-   **[Clerk Middleware Configuration](../doc/CLERK_MIDDLEWARE_CONFIG.md)**: Authentication setup, role-based
    access control, and security implementation
-   **[Appendix](../doc/APPENDIX.md)**: Database schemas, API reference, component library, deployment
    guides, and testing strategies

## Developer Documentation

# FleetFusion Product Requirements Document (PRD)

## Overview

FleetFusion is a modern, multi-tenant fleet management platform for logistics and transportation
companies. It provides robust tools for dispatching, driver management, vehicle tracking, regulatory
compliance, IFTA reporting, analytics, and more. The platform is built using Next.js 15 (for web
interface), TypeScript 5, and leverages a PostgreSQL database (via Prisma ORM). User authentication
and organization management are handled through Clerk's service, enabling multi-organization
(multi-tenant) support out-of-the-box.

## Target Users

-   **Fleet Owners / Managers:** Oversee all operations and need an all-in-one view of fleet
    performance.
-   **Dispatchers:** Plan and assign loads to drivers and vehicles, and monitor delivery progress.
-   **Drivers:** Execute deliveries and interact with the system to get assignments and record
    statuses.
-   **Compliance Officers:** Ensure that all drivers and vehicles meet regulatory requirements
    (document expiration, hours of service, etc.).
-   **Accountants/IFTA Clerks:** Handle fuel tax reporting (IFTA) and other financial record-keeping
    related to fleet operations.

## Core Features

-   **Multi-Tenancy:** Each company (tenant) has isolated data and user management. Users belong to
    organizations so that data never leaks across companies.
-   **User Management & Authentication:** Integration with Clerk for user sign-up, login, and
    organization (company) invites. Role-based access control ensures users see and do only what their
    role permits.
-   **Driver Management:** Maintain driver profiles including licenses, contact info, and compliance
    statuses. Track each driver’s status (active, on leave, etc.) and keep important documents
    (license, medical certificate) on file with expiry alerts.
-   **Vehicle Management:** Keep a registry of vehicles with details like VIN, plate, maintenance
    records, and inspection dates. Assign vehicles to loads and track their availability and service
    status.
-   **Dispatch & Load Management:** Create and dispatch loads (shipments) with origins, destinations,
    cargo details, etc. Assign drivers and vehicles to each load. Provide dispatchers with a dashboard
    to monitor active loads, track progress in real time, and make adjustments.
-   **Compliance Management:** Store and manage compliance documents (e.g., driver licenses,
    insurance, inspection forms). Provide a compliance dashboard with alerts for upcoming expirations
    and an audit log of compliance-related activities.
-   **IFTA Reporting:** Assist with International Fuel Tax Agreement (IFTA) compliance by tracking
    miles driven per jurisdiction and fuel purchases. Generate periodic IFTA reports that can be used
    for filings.
-   **Analytics & Reporting:** Offer dashboards and reports for key metrics like fleet utilization,
    on-time delivery rate, fuel efficiency, and costs. Allow filtering and drill-down to investigate
    specific aspects of operations.
-   **Settings & Configuration:** Allow admins to configure company-wide settings such as user roles,
    notification preferences, and possibly billing information. This includes managing which users
    have which roles within the platform.

## User Stories

-   _As a fleet manager, I want to easily onboard my company into FleetFusion and invite my team
    members, so that we can start using the system quickly._
-   _As a dispatcher, I want to create a new load and assign it to a driver and vehicle, so that I can
    schedule a delivery for a customer._
-   _As a driver, I want to see the deliveries assigned to me and update the status (picked up,
    delivered) and upload proof of delivery, so that the office knows the job status in real time._
-   _As a compliance officer, I want to be notified when a required document (like a vehicle
    inspection or a driver’s license) is about to expire, so I can take action to renew it and stay
    compliant._
-   _As an accountant, I want to generate a fuel tax report for last quarter’s operations, so that I
    can file our IFTA report accurately and on time._

## Success Metrics

-   **Reduced Onboarding Time:** How quickly a new company can fully set up their fleet and users in
    the system (goal: within one day of signing up).
-   **Operational Efficiency:** Reduction in manual paperwork and phone calls (e.g., percentage of
    dispatches managed digitally through the system).
-   **Compliance Adherence:** Fewer compliance violations (e.g., no driver is on the road with an
    expired license or vehicle inspection, as tracked by the system alerts).
-   **User Engagement:** Active usage by dispatchers and drivers (measured by logins per day or loads
    completed through the system) indicating the platform becomes a core part of daily operations.
-   **Retention & Satisfaction:** Companies continue to use FleetFusion over time (low churn rate) and
    report satisfaction (via feedback or NPS scores) due to time saved and improved oversight.

_See the [Technical Specification](../doc/TECHNICAL_SPEC.md) for the technical architecture and design that
support these product requirements._

# FleetFusion Technical Specification

## Architecture Overview

-   **Framework:** Next.js 15 using the App Router and React 19. The project primarily uses React
    Server Components for rendering, which allows efficient server-side data fetching and minimal
    client-side overhead.
-   **Language & Runtime:** TypeScript 5 for all frontend and backend code, enforcing strict typing.
    The Node.js runtime is utilized via Vercel serverless functions for backend logic.
-   **Database:** PostgreSQL is used as the primary data store, with schema and queries managed
    through the Prisma ORM. The database is hosted on Neon (a cloud Postgres provider). All data is
    partitioned by company (multi-tenant design).
-   **Authentication & Users:** Clerk is integrated for authentication, user management, and
    organization (tenant) management. Clerk provides a drop-in auth UI and handles user sessions,
    while FleetFusion uses Clerk’s organization feature to separate data by company.
-   **UI & Styling:** The UI is built with reusable components and styled using Tailwind CSS 4. Design
    tokens and a utility-first approach ensure consistent styling. The app supports dark mode (via a
    CSS class strategy).
-   **Project Structure:** The codebase is organized for clarity and scalability:

    -   `app/` – Next.js routes, including pages and layouts (organized by feature or section of the
        app).
    -   `components/` – Reusable presentational (dumb) components that are not tied to a single domain.
    -   `features/` – Domain-specific (smart) components and hooks for each feature (e.g., dispatch,
        compliance, etc.), often composed of general components plus feature-specific logic.
    -   `lib/` – Shared library code, such as utility functions, custom hooks, and especially **server
        actions** and **fetchers** (subdirectories like `lib/actions` and `lib/fetchers` contain all
        server-side mutation and data retrieval logic).
    -   `types/` – TypeScript type definitions that are shared across the app (e.g., domain models, API
        response shapes).
    -   `db/` – Database schema (in `schema.prisma` using Prisma ORM definitions) and migration files.
    -   `docs/` – Documentation (product specs, technical docs, guides).

-   **API Routes:** Next.js API routes under `app/api/` are used sparingly. Only a few endpoints
    exist, primarily for webhook handling (e.g., Clerk webhooks) and any third-party callbacks or
    public APIs. Most internal actions use server actions instead of REST endpoints.
-   **State Management:** There is minimal use of client-side state libraries since React's built-in
    Context and server-side state cover most needs. Temporary UI state is managed with React hooks
    within client components.

## Security

-   **Content Security Policy (CSP):** A strict CSP is configured to only allow required sources
    (including those needed for Clerk and Vercel analytics). This helps prevent XSS attacks by
    disallowing unauthorized scripts or resources.
-   **Secure Headers:** The application sets security-related HTTP headers via Next.js middleware or
    Vercel configuration. These include headers like `X-Frame-Options`, `X-XSS-Protection`, and
    `Strict-Transport-Security` to enforce secure browsing contexts.
-   **Authentication & Access Control:** FleetFusion relies on Clerk's secure session tokens (JWTs)
    which include organization context. Server-side checks and middleware ensure that only
    authenticated users (with valid roles/permissions) can access protected routes or perform actions.
-   **Multi-Tenant Isolation:** Every database query or mutation enforces a `companyId` filter (either
    implicitly via the relationships or explicitly in query conditions). This prevents any data
    leakage between tenant organizations. Additionally, the UI is scoped per organization (users can
    only see their company's data).
-   **Input Validation & Error Handling:** All form submissions and API payloads are validated using
    schemas (e.g., Zod schemas for request bodies). This ensures that the data meets expected formats
    and prevents bad data from causing runtime errors or security issues (like SQL injection or
    crashes). Errors are caught and handled gracefully, with user-friendly messages or fallback UI
    states.

## Integrations

-   **Clerk Authentication:** Third-party authentication is fully handled by Clerk. This covers user
    sign-up, email verification, password management, and organization invite workflows. The
    integration uses Clerk’s Next.js SDK for front-end components and server-side helpers. Clerk
    webhooks notify FleetFusion of changes, which are processed to sync with the internal database
    (see Appendix for details).
-   **Vercel Platform:** Deployment and hosting are through Vercel. The app takes advantage of
    Vercel's serverless functions for API routes and edge network for global CDN caching of assets.
    Vercel Analytics might be used for traffic and performance insights. The project is configured to
    build and deploy automatically via Vercel on new commits to the main branch (continuous
    deployment).
-   **Future Integrations:** _(Placeholders for potential integrations)_ The architecture allows
    adding integrations such as map APIs (for route tracking) or ELD devices (for driver logs) by
    creating new API routes or server actions for those external services.

## Testing

-   **Unit Testing:** Key utilities and logic in `lib/` (like validation schemas, calculation
    functions, etc.) include unit tests. These ensure that individual functions behave correctly given
    various inputs.
-   **Integration Testing:** The server actions and critical components are tested in integration,
    meaning a test might call an action with a fake request context and verify it interacts with the
    database (often using a test database or transaction rollback strategy) as expected.
-   **End-to-End (E2E) Testing:** End-to-end tests simulate user workflows in a staging environment or
    using tools like Playwright/Cypress. Major user flows such as the onboarding process, dispatch
    creation, and compliance document upload are covered. These tests ensure that all pieces
    (frontend, backend, database, third-party auth) work together correctly.
-   **Automated CI Checks:** All tests are run in CI for each commit. Linting (ESLint) and
    type-checking (TypeScript compiler) are also part of the pipeline to catch errors early. Only code
    that passes all checks is deployed to production.

## Deployment

-   **Environment Setup:** Before deployment, ensure that all necessary environment variables are set
    (Clerk API keys, database URL, etc.). The repository provides an `.env.example` listing required
    keys. In production (Vercel), these variables are configured in the project settings. In
    development, a `.env.local` file is used.
-   **Vercel Deployment:** The application is deployed on Vercel, which handles building and serving
    the Next.js app. Commits to the main branch trigger Vercel to build and deploy the latest version.
    Vercel handles scaling, SSL (HTTPS), and CDN distribution automatically.
-   **CI/CD Pipeline:** A GitHub Actions workflow is set up to automate testing and deployment:

    -   On push or merge to `main`, the workflow runs the test suite and build process.
    -   If tests pass, it uses Vercel's CLI or API (with stored credentials) to initiate a deployment of
        the new build.
    -   This ensures that only validated code is deployed. (Additionally, branch protections may require
        that pull requests pass all CI checks before merging.)

-   **Post-Deployment Monitoring:** After deployment, admins or developers verify core functionality.
    Integration with monitoring tools (e.g., Sentry for error tracking) helps catch runtime exceptions
    or performance issues in production. Vercel’s dashboard and logs are also used to monitor each
    deployment and can roll back to a previous deployment if a serious issue is discovered.

_For more detailed diagrams, data flows, and integration configurations (e.g., Clerk authentication
flows, multi-tenancy enforcement, and CI/CD setup), see the [Appendix](../doc/APPENDIX.md)._

# Appendix

## Authentication and Clerk Integration

**Environment & Configuration:** FleetFusion uses [Clerk](https://clerk.com/) for authentication and
organization management. In development, a Clerk instance (e.g.,
`driving-gelding-14.clerk.accounts.dev`) is configured, and a separate instance (with production
keys) is used in production. Key environment variables include:

| Environment Variable                | Description                          | Example value                              |
| ----------------------------------- | ------------------------------------ | ------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend (publishable) API key | `pk_live_...` (prod) / `pk_test_...` (dev) |
| `CLERK_SECRET_KEY`                  | Clerk backend secret API key         | `sk_live_...` (prod) / `sk_test_...` (dev) |
| `CLERK_WEBHOOK_SECRET`              | Secret for verifying Clerk webhooks  | `whsec_xxx...`                             |
| `NEXT_PUBLIC_APP_URL`               | Base URL of the application          | `https://fleet-fusion.vercel.app` (prod)   |

Make sure to configure the Clerk dashboard with the correct allowed domains and redirect URLs for
both development and production. For example, when developing locally with an ngrok tunnel, add the
ngrok domain to Clerk allowed origins and set the webhook URL to your ngrok address (e.g.,
`https://<subdomain>.ngrok-free.app/api/clerk/webhook-handler`).

**Onboarding Flow:** New users who sign up are guided through an onboarding process:

-   The first user of an organization creates a company via an **Onboarding Wizard** (after sign-up)
    where they provide company details (name, DOT number, address, etc.).
-   On submitting the onboarding form, FleetFusion updates the user's Clerk organization metadata
    (marking onboarding as complete and storing the company info in Clerk).
-   After onboarding, the user (an Admin) is redirected to the main dashboard. The onboarding page is
    protected so that it cannot be accessed again once completed.
-   During onboarding, role-based access control (RBAC/ABAC) is initialized: the user creating the org
    becomes the Admin by default.

**Roles and Permissions:** Clerk Organizations in FleetFusion define roles for each user within a
company (organization). The main roles include:

-   **Admin (org\:admin):** Full access, including managing users, settings, and billing.
-   **Dispatcher (org\:dispatcher):** Can create and manage loads, assign drivers to vehicles, and
    monitor dispatch operations.
-   **Driver (org\:driver):** Can view their own assigned loads, update load status (pickup/delivery),
    upload relevant documents, and log hours of service.
-   **Compliance Officer (org\:compliance):** Can manage compliance documents (upload and review) and
    view compliance dashboards/reports.
-   **Member (org\:member):** A default non-privileged role for basic access (if needed for additional
    team members with view-only or limited permissions).
-   _(System roles:_ **org\:sys\_**\*): These special permissions are used internally by Clerk for
    organization management (e.g., managing organization profiles, memberships, etc.). FleetFusion
    leverages these under the hood when syncing org data, but they are not assigned to end users
    directly.

FleetFusion uses an Attribute-Based Access Control (ABAC) approach:

-   A user's JWT session token (from Clerk) includes their organization ID (`org.id`), role
    (`org.role`), and a list of permission strings (`org_membership.permissions`) derived from that
    role.
-   The application checks these claims in Next.js Middleware and within server-side actions to
    enforce access control. For instance, an Admin role is required to access admin-only API routes or
    pages like the user management screen.
-   All permission strings and their mappings to roles are defined in a central file
    (`lib/constants/permissions.ts`), making it easy to update roles or add new permissions. This
    central mapping is the source of truth for what each role can do.

**Forgot Password Flow:** FleetFusion extends Clerk's standard password-reset capability:

-   The sign-in page includes a **Forgot Password?** link, leading to a dedicated **Forgot Password**
    page.
-   The Forgot Password page uses Clerk's `useSignIn()` hook with a two-step flow: first, the user
    enters their email to request a reset code (sent via email); second, they submit that code along
    with a new password to complete the reset.
-   On success, the user is redirected to the FleetFusion dashboard. This custom flow provides a
    seamless in-app experience for password resets, rather than using Clerk’s default hosted page.

**Sign Out:** The application uses Clerk's sign-out functionality via a custom **SignOutButton**
component:

-   The component invokes `useClerk()` from Clerk’s React library and calls
    `signOut({ redirectUrl: '/' })` on click, which ends the session and returns the user to the
    public homepage.
-   This button is included in the protected dashboard navigation. It ensures that user session
    cookies are properly cleared and (with `redirectUrl`) that the user lands on a logged-out page.

**Webhook Integration:** Clerk webhooks keep FleetFusion’s database in sync with Clerk’s data:

-   A webhook handler endpoint exists at `/api/clerk/webhook-handler`. Clerk is configured to send
    events like `organization.created`, `organizationMembership.created`,
    `organizationMembership.deleted`, and `user.created` to this endpoint.
-   The webhook handler verifies each incoming event using the `CLERK_WEBHOOK_SECRET` to ensure
    authenticity.
-   On receiving events, the handler performs the corresponding database updates:

    -   For example, when an organization is created via Clerk (during onboarding), the handler will
        create a new entry in the `companies` table with the Clerk org ID and company name.
    -   When a user joins an organization, a new `company_users` record is inserted, linking that user
        (by Clerk user ID) to the company (with a role).
    -   If a user or membership is removed, the handler will mark records accordingly (or delete,
        depending on design) to keep data consistent.

-   This design means the Neon PostgreSQL database always reflects the current state of organizations,
    members, and users as known by Clerk.

## Multi-Tenancy and Data Isolation

FleetFusion is designed as a multi-tenant application, meaning multiple companies (tenants) share
the platform but have isolated data:

-   **Organization-to-Company Mapping:** Each Clerk Organization corresponds to a record in the
    `companies` database table. The Clerk `org.id` is stored as an identifier in that table
    (`clerkOrgId`), allowing lookups from auth context to database records.
-   **Company Context in Application:** Once logged in, a user selects (or is defaulted to) an active
    company context (if they belong to more than one organization). This context is passed through the
    app (via a React context provider and Next.js middleware) so that every page and action knows the
    current `companyId`.
-   **Scoped Database Queries:** All database queries performed via the Prisma ORM include a
    `where companyId = ...` clause for tables that contain tenant data. For convenience, relationships
    in Prisma are set up such that, for example, fetching a driver by ID will inherently require
    matching the `companyId` of that driver to the `companyId` of the current session.
-   **Front-End Routing:** The Next.js application can enforce that certain routes or layouts are
    organization-specific. For instance, a user might have a company switcher in the UI, and the
    selection could be reflected in the URL (e.g., `/dashboard?companyId=X` or a subdomain per company
    pattern). In FleetFusion’s case, a simpler approach uses the session’s org context without needing
    subdomains.
-   **Cascade Deletion & Data Integrity:** To maintain data isolation, if a company were ever deleted
    (for example, if a tenant leaves the service and requests data removal), all related records
    (drivers, vehicles, loads, etc. with that `companyId`) should also delete via cascade rules in the
    database. The schema uses `ON DELETE CASCADE` on foreign key constraints for this purpose. This
    prevents orphaned records that belong to a non-existent tenant.
-   **Testing Multi-Tenancy:** The development/test environments consider multi-tenant scenarios
    (e.g., ensuring one user's data is not accessible by another in tests). We create seed data in
    separate organizations to verify that queries and UI elements properly segregate information.

## Data Flow and State Management

FleetFusion leverages Next.js 15 with React 19 features to manage data flow efficiently between the
server and client:

-   **React Server Components (RSC):** Most pages and components that fetch data are implemented as
    Server Components. They fetch the necessary data on the server (via direct database calls or via
    helper functions in `lib/fetchers/*`) before rendering the UI, which improves performance and SEO.
-   **Server Actions:** All create, update, or delete operations (mutations) are handled via Next.js
    React Server Actions (server-side form actions). These functions (located in `lib/actions/*`) run
    on the server, ensuring secure and direct data processing without exposing sensitive logic to the
    client. For example, there might be a `addVehicle` action in `lib/actions/vehicle-actions.ts` that
    inserts a new vehicle into the database and can be called by a form submission.
-   **Client Components for Interactivity:** Components that require interactivity (like dynamic
    tables, form inputs, or maps) are client components. They receive data via props (already fetched
    by a parent server component) or via context. This pattern avoids unnecessary data fetching on the
    client and leverages the server-rendered data.
-   **React Context:** Global app context is used for things like the current company (tenant) and
    user information. `CompanyContext` provides the active `companyId` throughout the component tree,
    so nested components can access it without prop drilling. Similarly, other contexts might provide
    theme or user preferences if needed.
-   **Minimal Client State Libraries:** Because of heavy use of server-side rendering and context, the
    need for client state management libraries (like Redux or MobX) is greatly reduced. Local
    component state and Context cover most use cases. If any asynchronous data updating is needed
    client-side (for example, real-time updates or background refresh of certain data), lightweight
    solutions or the built-in React querying (with useSWR or similar) could be considered, but by
    design the app avoids this for initial page loads.
-   **Caching Pattern:** Data fetchers leverage `unstable_cache` with explicit `Promise` return types
    to ensure consistent server-side caching and predictable revalidation.

Below is a simplified data flow diagram demonstrating how data moves in FleetFusion:

```plaintext
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│ Server Component◄─────┤ lib/fetchers   ◄─────┤   Database    │
│   (Next.js)    │     │   (Data Fetch) │     │  (PostgreSQL)  │
└───────┬────────┘     └────────────────┘     └────────────────┘
        │                                             ▲
        │ Props                                       │
        ▼                                             │
┌────────────────┐     ┌────────────────┐     ┌──────┴─────────┐
│                │     │                │     │                │
│ Client Component─────►   Server Action─────►     Mutation    │
│   (React)      │     │   (Form Submit) │     │ (Database Ops)│
└────────────────┘     └────────────────┘     └────────────────┘
```

In the above diagram:

-   Data is fetched on the server (left side) through `lib/fetchers` functions and passed as props to
    the relevant components.
-   When a user triggers a mutation (e.g., submitting a form to add a new driver), a Server Action
    handles it on the server, performs the database mutation, and the page can then re-fetch or update
    to reflect the change.
-   The separation ensures that initial page loads are fast and complete (no loading spinners for
    data), and that secure operations are not exposed to the client beyond the minimal necessary
    interface.

**No Redundant Client Fetches:** Thanks to server-side data loading, the app avoids heavy use of
client-side data fetching for primary data. Patterns like using `useEffect` to load data on page
mount are not needed for most pages, reducing complexity and potential bugs. This also simplifies
compliance with CSP, as fewer external calls are made from the browser.

## Database Schema Reference

FleetFusion uses PostgreSQL with the Prisma ORM to define and manage the database schema. Key
aspects of the schema include:

-   **Companies & Users:**

    -   **companies** – Stores each tenant company's information (name, address, etc.) along with a
        unique identifier (Clerk org ID) linking it to the auth layer.
    -   **company_users** – Maps users to companies with their roles. Each entry links a Clerk user ID
        to a company ID and includes role metadata (e.g., admin, dispatcher).

-   **Core Fleet Entities:**

    -   **drivers** – Contains driver profiles (name, license info, etc.) and is linked to a companyId.
    -   **vehicles** – Contains vehicle records (make, model, VIN, etc.) and is linked to a companyId.
    -   **loads** – Represents a dispatch load/shipment, including fields for origin, destination, cargo
        details, assigned driver, assigned vehicle, schedule times, status, and is linked to a
        companyId.

-   **Compliance & Documents:**

    -   **documents** – A general table for uploaded documents (could be used for storing file meta like
        URL, upload date).
    -   **compliance_documents** – (If distinct from documents) Stores specific compliance record
        entries, such as a record of a driver's license or a vehicle inspection, possibly linking to an
        entry in `documents` for the file itself. Also linked to the relevant driver/vehicle and
        companyId.
    -   **hos_logs** – Hours-of-service logs for drivers (each entry could record driver, start/end
        times of driving, status type, etc., linked to companyId and driverId).
    -   **maintenance_records** – Records of vehicle maintenance or inspections performed (date, type of
        service, notes), linked to vehicleId and companyId.

-   **Common Fields & Conventions:**

    -   All primary keys are UUIDs (universally unique identifiers). This ensures uniqueness across
        distributed systems and avoids sequential ID predictability.
    -   Timestamps (`createdAt`, `updatedAt`) are included in most tables to track when records are
        added or modified. Prisma ORM can auto-manage these or they can be set via triggers.
    -   Foreign key relations are set with `ON DELETE CASCADE` for any child records that should be
        removed if a parent is deleted (e.g., deleting a driver could cascade delete their HOS logs or
        compliance docs; deleting a company cascades to all its data).

-   **Referential Integrity:** The schema design, combined with Clerk integration, ensures that for
    example:

    -   A `company_users` record should not exist without a corresponding `companies` entry.
    -   A `loads` entry with a `driverId` and `vehicleId` should reference valid entries in `drivers`
        and `vehicles` that belong to the same company.
    -   Prisma's schema definitions and TypeScript types help enforce these relationships in code,
        while the database enforces them at runtime.

Developers can refer to the `db/schema.ts` file for the complete and authoritative schema
definitions including all fields and relationships. Additionally, migration files (if using
Prisma's migrations or an external tool) provide a history of schema changes.

## Deployment and CI/CD

FleetFusion is deployed as a modern web application with continuous integration and deployment
practices:

-   **Hosting:** The production environment is hosted on Vercel, which provides a convenient platform
    for Next.js applications. The default production domain is `fleet-fusion.vercel.app` (a custom
    domain can be configured as needed).
-   **Environment Management:** Sensitive configuration is provided via environment variables. During
    deployment, these are set in Vercel's dashboard (for production) and via `.env.local` files for
    local development. It’s crucial to set production Clerk keys, the Neon database URL, and any
    third-party API keys in the Vercel environment before deploying.
-   **Manual Deployment:** Initially, one can deploy FleetFusion by connecting the GitHub repo to
    Vercel and using the Vercel UI to trigger a deployment. In this flow, Vercel will install
    dependencies and run `next build` to compile the app. Ensure the project settings on Vercel (build
    command, output directory, etc.) are properly configured (Next.js defaults are usually
    auto-detected).
-   **Continuous Deployment (CD):** The project is configured for automatic deployments. Whenever
    changes are pushed to the `main` branch (after passing tests), Vercel will automatically build and
    deploy the new version. This provides a seamless deployment process, where code merges result in
    live updates to the app.
-   **Continuous Integration (CI):** GitHub Actions handle testing and integration steps:

    -   A typical workflow might run on every pull request and push to `main`. It will install
        dependencies, run `eslint` for linting, run `tsc` for type checks, and execute all tests.
    -   Only if these steps succeed can code be merged or deployed. This prevents broken builds or
        obvious bugs from reaching production.

-   **Vercel Integration via CI:** In addition to Vercel’s own git integration, the CI workflow can
    deploy to Vercel by using Vercel’s API tokens. Secrets such as `VERCEL_TOKEN`, `VERCEL_ORG_ID`,
    and `VERCEL_PROJECT_ID` are stored in GitHub and used by the action to authenticate with Vercel’s
    API. This way, the CI can programmatically trigger deployments after tests pass.
-   **Post-Deployment Verification:** After deploying, it’s recommended to perform a quick smoke test:

    -   Visit the production site and ensure pages are loading.
    -   Test login and a few key user flows (e.g., create a load, sign out, etc.) to confirm that the
        production environment (with its environment variables) is configured correctly (especially
        Clerk, since incorrect domains or keys would affect auth).
    -   Check Vercel's function logs or monitoring tools for any runtime errors that might not have
        appeared in testing.

-   **Rollback Strategy:** Vercel keeps previous deployments available. If a new deployment has a
    critical issue, the team can use Vercel's "Rollback" feature to instantly revert to the last good
    deployment. Additionally, maintaining good version control practices (like tagging releases) helps
    in quickly identifying a stable commit to redeploy if needed.

By adhering to these DevOps practices, FleetFusion achieves a robust deployment pipeline with
minimal downtime, quick iteration cycles for developers, and confidence that each release has been
tested and is easy to monitor.

---

## Multi-Tenant Routing & ABAC (2025 Update)

### Directory Structure

All tenant-specific pages are now under:

-   `app/(tenant)/[orgId]/dashboard/page.tsx`
-   `app/(tenant)/[orgId]/analytics/page.tsx`
-   `app/(tenant)/[orgId]/dispatch/page.tsx`
-   `app/(tenant)/[orgId]/drivers/page.tsx`
-   `app/(tenant)/[orgId]/drivers/[userId]/page.tsx`
-   `app/(tenant)/[orgId]/compliance/page.tsx`
-   `app/(tenant)/[orgId]/compliance/[userId]/page.tsx`
-   `app/(tenant)/[orgId]/vehicles/page.tsx`
-   `app/(tenant)/[orgId]/ifta/page.tsx`
-   `app/(tenant)/[orgId]/settings/page.tsx`

#### Dynamic Segments

-   `[orgId]` is required for all tenant routes (enforces org isolation and SSR cache safety).
-   `[userId]` is used for user-specific pages (e.g., driver/compliance officer dashboards).

### ABAC Middleware

-   All protected tenant routes are enforced via ABAC in `middleware.ts` using a centralized
    permission map from `lib/auth/permissions.ts`.
-   Middleware extracts `[orgId]` and `[userId]` from the URL and checks Clerk session claims for role
    and permissions.
-   Only users with the correct permissions (not just roles) can access each page.
-   API routes are also protected by permission checks.

#### Route-to-Permission Mapping

| Page/Route             | Who Should Access?                 | Permission(s) Required  |
| ---------------------- | ---------------------------------- | ----------------------- |
| /dashboard             | All roles with fleet:view          | fleet:view              |
| /analytics             | Admin, Dispatcher, Compliance      | analytics:view          |
| /dispatch              | Admin, Dispatcher                  | dispatch:view           |
| /drivers               | Admin, Dispatcher, Driver          | drivers:view            |
| /drivers/`[userId]`    | Driver (own profile/logs)          | drivers:view or self    |
| /compliance            | Compliance Officer, Admin          | compliance:view         |
| /compliance/`[userId]` | Compliance Officer (own dashboard) | compliance:view or self |
| /vehicles              | Admin, Dispatcher                  | fleet:view              |
| /ifta                  | Accountant, Admin                  | ifta:view               |
| /settings              | Admin                              | settings:view           |

<!--
[userId]: Refers to the dynamic segment in the route, representing the unique identifier of a user (driver).
-->
