<!-- @format -->

# Contributing Guidelines

Welcome to FleetFusion! We're excited that you want to contribute to this multi-tenant SaaS platform
for fleet management. This guide will help you get started with contributing to the codebase.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation Standards](#documentation-standards)
7. [Pull Request Process](#pull-request-process)
8. [Architecture Guidelines](#architecture-guidelines)
9. [Security Considerations](#security-considerations)

## GitHub Flow & Branching Best Practices

FleetFusion uses **GitHub Flow** for all development:

-   The `main` branch is always deployable and protected by required reviews and CI.
-   All work is done in short-lived feature branches (e.g., `feature/xyz`, `fix/bug`, `docs/update`).
-   Open a pull request from your branch to `main` for review and merge. Use squash merge to keep
    history linear.
-   After merging, delete your feature branch (auto-deletion is enabled).
-   Avoid long-lived branches like `develop` or `release` unless specifically required.

### Branch Naming

Use descriptive branch names with standard prefixes:

**Standard Prefixes:**

-   `feature/` - New features and enhancements
-   `fix/` - Bug fixes and patches
-   `docs/` - Documentation updates
-   `refactor/` - Code refactoring (no functional changes)
-   `test/` - Test additions/updates
-   `chore/` - Maintenance, dependencies, build changes
-   `config/` - Configuration changes
-   `codex/` - AI-generated changes (for Codex AI agent only)

**Examples:**

-   `feature/vehicle-tracking`
-   `fix/dashboard-crash`
-   `docs/api-authentication`
-   `refactor/user-service`
-   `test/vehicle-validation`
-   `chore/update-dependencies`
-   `config/database-setup`

**Guidelines:**

-   Keep names concise but descriptive
-   Use kebab-case for descriptions
-   Only use `codex/` for branches created by the Codex AI agent
-   Delete branches after merging (auto-deletion enabled)

## AI Agent Contribution Rules

-   **Codex and Copilot must never commit directly to `main`.**
-   All AI-generated changes must be made in a new branch (preferably `codex/` prefix) and submitted
    via pull request.
-   All AI PRs must pass CI and receive human review before merge.
-   AI-generated PRs should be labeled (e.g., `AI-Generated`) for traceability.
-   Codex should prefer calling well-typed, documented functions and must not bypass branch protection
    or CI.

See `agents.md` for full agent delegation and automation rules.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

-   **Be respectful**: Treat all community members with respect and kindness
-   **Be inclusive**: Welcome newcomers and help them learn
-   **Be constructive**: Provide helpful feedback and criticism
-   **Be professional**: Maintain professional communication in all interactions

## Getting Started

### Prerequisites

Before contributing, ensure you have:

-   Node.js 18+ installed
-   Git configured with your GitHub account
-   Access to the development environment
 -   Understanding of the [Architecture](.wiki/Architecture.md) and [Getting Started](.wiki/Getting-Started.md)
      guides

### Initial Setup

1. **Fork and Clone**

    ```bash
    git clone https://github.com/your-username/fleetfusion-architecture.git
    cd fleetfusion-architecture
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**

    ```bash
    cp .env.example .env.local
    # Fill in your environment variables
    ```

4. **Database Setup**

    ```bash
    npm run db:push
    npm run db:seed
    ```

5. **Start Development Server**
    ```bash
    npm run dev
    ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern: `<type>/<description>`

**Supported Types:**

-   `feature/description-of-feature` - New features and enhancements
-   `fix/description-of-bug-fix` - Bug fixes and patches
-   `docs/description-of-documentation-change` - Documentation updates
-   `refactor/description-of-refactor` - Code refactoring (no functional changes)
-   `test/description-of-test-addition` - Test additions/updates
-   `chore/description-of-maintenance` - Maintenance, dependencies, build changes
-   `config/description-of-configuration-change` - Configuration changes

**Examples:**

-   `feature/driver-compliance-dashboard`
-   `fix/load-assignment-validation`
-   `docs/api-reference-updates`
-   `refactor/database-query-optimization`
-   `test/vehicle-model-validation`
-   `chore/dependency-security-updates`
-   `config/docker-compose-setup`
-   `config/github-workflows-setup`

### Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

-   `feat`: New feature
-   `fix`: Bug fix
-   `docs`: Documentation changes
-   `style`: Code style changes (formatting, etc.)
-   `refactor`: Code refactoring
-   `test`: Adding or updating tests
-   `config`: Configuration changes

**Examples:**

```
feat(auth): add multi-factor authentication support

Add MFA support using Clerk's built-in MFA capabilities.
Includes SMS and TOTP authentication methods.

Closes #123
```

```
fix(dashboard): resolve metric calculation error

Fixed incorrect calculation of on-time delivery rate
that was caused by timezone handling issues.

Fixes #456
```

### Issue Linking and Closing Keywords

Use closing keywords in PR descriptions and commit messages to automatically close related issues when changes are merged:

**Supported Keywords:**

-   `Closes #123` - General issue closure
-   `Fixes #456` - Bug fix closure (preferred for bug fixes)
-   `Resolves #789` - General resolution (preferred for feature requests)
-   `Closes: #123` - Alternative syntax with colon

**Multiple Issues:**

-   `Fixes #123, Closes #456` - Close multiple issues
-   `Closes #123 and #456` - Alternative syntax

**Cross-Repository:**

-   `Closes DigitalHerencia/FleetFusion#123` - Close issue in another repo
-   `Fixes https://github.com/DigitalHerencia/FleetFusion/issues/123` - Full URL

**Examples in Commit Messages:**

```
feat(tracking): implement real-time vehicle location updates

Added WebSocket connection for live GPS coordinate streaming.
Includes automatic reconnection and offline buffering.

Closes #234
```

```
fix(auth): resolve session timeout handling

Fixed race condition where expired sessions weren't properly
refreshed, causing users to be incorrectly logged out.

Fixes #567, Closes #568
```

**Best Practices:**

-   Place closing keywords in commit body or PR description, not the title
-   Use consistent keywords (`Fixes` for bugs, `Closes` for features/tasks)
-   Reference issues early in development to show progress
-   Use `Closes` in final merge commit to ensure automatic closure

## Coding Standards

### TypeScript Guidelines

1. **Strict Type Safety**

    ```typescript
    // ✅ Good: Explicit types
    interface DashboardMetrics {
        activeVehicles: number
        onTimeDeliveryRate: number
    }

    // ❌ Avoid: Any types
    const data: any = fetchData()
    ```

2. **Use Interfaces for Object Shapes**

    ```typescript
    // ✅ Good: Interface for component props
    interface LoadCardProps {
        load: Load
        onStatusChange: (id: string, status: LoadStatus) => void
    }
    ```

3. **Zod for Runtime Validation**
    ```typescript
    // ✅ Good: Runtime validation with Zod
    const createLoadSchema = z.object({
        origin: z.string().min(1),
        destination: z.string().min(1),
        weight: z.number().positive(),
    })
    ```

### React Guidelines

1. **Server Components by Default**

    ```typescript
    // ✅ Good: Server Component (default)
    export default async function DashboardPage() {
        const data = await fetchDashboardData()
        return <Dashboard data={data} />
    }

    // Only use 'use client' when necessary
    ;("use client")
    export function InteractiveChart() {
        const [data, setData] = useState([])
        // Interactive logic here
    }
    ```

2. **Component Organization**

    ```
    components/
    ├── ui/           # Generic, reusable components
    ├── dashboard/    # Dashboard-specific components
    ├── auth/         # Authentication components
    └── shared/       # Shared business components
    ```

3. **Props Interface Pattern**

    ```typescript
    interface ComponentProps {
        // Required props first
        title: string
        data: DataType[]

        // Optional props after
        className?: string
        onAction?: () => void
    }
    ```

### Styling Guidelines

1. **Tailwind CSS Conventions**

    ```typescript
    // ✅ Good: Logical grouping and responsive design
    <div className="
      flex items-center justify-between
      p-4 rounded-lg border
      hover:bg-gray-50
      md:p-6
      dark:border-gray-700 dark:hover:bg-gray-800
    ">
    ```

2. **CSS Custom Properties**

    ```css
    /* Use design tokens */
    .custom-component {
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        border-radius: var(--radius);
    }
    ```

3. **Component Variants**
    ```typescript
    // Use class-variance-authority for component variants
    const buttonVariants = cva(
        "inline-flex items-center justify-center rounded-md",
        {
            variants: {
                variant: {
                    default: "bg-primary text-primary-foreground",
                    destructive: "bg-destructive text-destructive-foreground",
                },
                size: {
                    default: "h-10 px-4 py-2",
                    sm: "h-9 rounded-md px-3",
                },
            },
        }
    )
    ```

### Database Guidelines

1. **Prisma Schema Conventions**

    ```prisma
    model Organization {
      id        String   @id @default(cuid())
      clerkId   String   @unique @map("clerk_id")
      name      String
      createdAt DateTime @default(now()) @map("created_at")
      updatedAt DateTime @updatedAt @map("updated_at")

      // Relations
      users     User[]
      vehicles  Vehicle[]

      @@map("organizations")
    }
    ```

2. **Query Optimization**

    ```typescript
    // ✅ Good: Include only necessary relations
    const load = await prisma.load.findUnique({
        where: { id },
        include: {
            driver: { select: { name: true, phone: true } },
            vehicle: { select: { unitNumber: true } },
        },
    })

    // ❌ Avoid: Over-fetching data
    const load = await prisma.load.findUnique({
        where: { id },
        include: {
            driver: true, // Fetches all driver fields
            vehicle: true, // Fetches all vehicle fields
        },
    })
    ```

## Testing Guidelines

### Test Structure

1. **Test File Organization**

    ```
    __tests__/
    ├── components/    # Component tests
    ├── lib/          # Utility function tests
    ├── app/          # Page and API route tests
    └── e2e/          # End-to-end tests
    ```

2. **Unit Test Example**

    ```typescript
    // components/__tests__/MetricCard.test.tsx
    import { render, screen } from "@testing-library/react"
    import { MetricCard } from "../MetricCard"

    describe("MetricCard", () => {
        it("displays metric value correctly", () => {
            render(
                <MetricCard
                    title='Active Vehicles'
                    value={42}
                    change={{
                        value: 5,
                        type: "increase",
                        timeframe: "last month",
                    }}
                />
            )

            expect(screen.getByText("Active Vehicles")).toBeInTheDocument()
            expect(screen.getByText("42")).toBeInTheDocument()
        })
    })
    ```

3. **Integration Test Example**

    ```typescript
    // app/__tests__/dashboard.test.tsx
    import { GET } from "../api/dashboard/route"
    import { NextRequest } from "next/server"

    describe("/api/dashboard", () => {
        it("returns dashboard metrics for authenticated user", async () => {
            const request = new NextRequest("http://localhost/api/dashboard")
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toHaveProperty("activeVehicles")
        })
    })
    ```

### Test Coverage Requirements

-   **Minimum Coverage**: 80% for new code
-   **Critical Paths**: 100% coverage for authentication, authorization, and data mutations
-   **Integration Tests**: All API endpoints must have integration tests
-   **E2E Tests**: Core user flows must have end-to-end test coverage

## Documentation Standards

### Code Documentation

1. **TSDoc for Functions**

    ```typescript
    /**
     * Calculates the on-time delivery rate for an organization
     * @param organizationId - The organization identifier
     * @param timeframe - Number of days to look back
     * @returns Promise resolving to percentage (0-100)
     * @throws {ValidationError} When organizationId is invalid
     */
    export async function calculateOnTimeDeliveryRate(
        organizationId: string,
        timeframe: number = 30
    ): Promise<number> {
        // Implementation
    }
    ```

2. **Component Documentation**
    ````typescript
    /**
     * Dashboard metric card component
     *
     * @example
     * ```tsx
     * <MetricCard
     *   title="Active Vehicles"
     *   value={42}
     *   change={{ value: 5, type: 'increase', timeframe: 'last month' }}
     * />
     * ```
     */
    export function MetricCard({ title, value, change }: MetricCardProps) {
        // Implementation
    }
    ````

### README Updates

When adding new features, update relevant documentation:

-   Update [API Reference](./API-Reference.md) for new endpoints
-   Update [Component Library](./Component-Library.md) for new components
 -   Update [Architecture](.wiki/Architecture.md) for architectural changes

## Pull Request Process

### Before Submitting

1. **Run Tests**

    ```bash
    npm run test
    npm run test:e2e
    ```

2. **Check Linting**

    ```bash
    npm run lint
    npm run type-check
    ```

3. **Test Database Changes**

    ```bash
    npm run db:reset
    npm run db:seed
    ```

4. **Resolve Merge Conflicts** (if any)

    If your PR has merge conflicts, follow our [Merge Conflict Resolution Guide](./docs/merge-conflict-resolution.md) for step-by-step instructions.

### PR Template

Use this template for your pull requests:

```markdown
## Description

Brief description of changes made.

## Type of Change

-   [ ] Bug fix (non-breaking change which fixes an issue)
-   [ ] New feature (non-breaking change which adds functionality)
-   [ ] Breaking change (fix or feature that would cause existing functionality to not work as
        expected)
-   [ ] Documentation update

## Testing

-   [ ] Unit tests pass
-   [ ] Integration tests pass
-   [ ] E2E tests pass
-   [ ] Manual testing completed

## Checklist

-   [ ] Code follows the style guidelines
-   [ ] Self-review of code completed
-   [ ] Code is commented, particularly in hard-to-understand areas
-   [ ] Corresponding documentation updates made
-   [ ] No new warnings or errors introduced

## Screenshots (if applicable)

Add screenshots for UI changes.

## Related Issues

<!-- Use closing keywords to automatically close issues when this PR is merged -->
<!-- Examples: -->

Closes #(issue number)

<!-- Fixes #(issue number) - for bug fixes -->
<!-- Resolves #(issue number) - for feature requests -->
<!-- Multiple issues: Fixes #123, Closes #456 -->
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one approving review required
3. **Testing**: Manual testing for UI changes
4. **Documentation**: Documentation updates reviewed

## Architecture Guidelines

### Feature Development

1. **Domain-Driven Design**

    ```
    features/
    ├── dispatch/
    │   ├── components/    # UI components
    │   ├── lib/          # Business logic
    │   ├── types/        # Type definitions
    │   └── tests/        # Feature tests
    ```

2. **Server Actions Pattern**

    ```typescript
    // lib/actions/dispatchActions.ts
    "use server"

    export async function createLoadAction(
        formData: FormData
    ): Promise<ActionResult<Load>> {
        // Validation, authorization, and business logic
    }
    ```

3. **Data Fetching Pattern**
    ```typescript
    // lib/fetchers/dispatchFetchers.ts
    export async function getActiveLoads(
        organizationId: string
    ): Promise<Load[]> {
        // Data fetching with proper caching
    }
    ```

### Performance Considerations

1. **Caching Strategy**

    ```typescript
    import { unstable_cache } from "next/cache"

    export const getCachedData = unstable_cache(
        async (id: string) => {
            // Data fetching logic
        },
        ["cache-key"],
        {
            revalidate: 300,
            tags: ["data-tag"],
        }
    )
    ```

2. **Database Optimization**
    ```typescript
    // Use select to limit fields
    const loads = await prisma.load.findMany({
        where: { organizationId },
        select: {
            id: true,
            loadNumber: true,
            status: true,
            // Only include needed fields
        },
    })
    ```

## Security Considerations

### Authentication & Authorization

1. **Always Verify User Context**

    ```typescript
    export async function updateLoad(loadId: string, data: UpdateLoadData) {
        const { user } = await getCurrentUser()

        // Verify user has permission to update this load
        await verifyLoadAccess(user.organizationId, loadId)

        // Proceed with update
    }
    ```

2. **Input Validation**

    ```typescript
    // Always validate inputs with Zod
    const validatedData = updateLoadSchema.parse(data)
    ```

3. **SQL Injection Prevention**

    ```typescript
    // ✅ Good: Use Prisma ORM (prevents SQL injection)
    const loads = await prisma.load.findMany({
        where: { organizationId },
    })

    // ❌ Never: Raw SQL with user input
    const loads = await prisma.$queryRaw`
      SELECT * FROM loads WHERE organization_id = ${organizationId}
    `
    ```

### Data Privacy

1. **Multi-tenant Isolation**

    ```typescript
    // Always include organizationId in queries
    const vehicle = await prisma.vehicle.findUnique({
        where: {
            id: vehicleId,
            organizationId: user.organizationId, // Tenant isolation
        },
    })
    ```

2. **Sensitive Data Handling**
    ```typescript
    // Don't log sensitive information
    console.log("User action:", {
        action: "update_profile",
        userId: user.id,
        // Don't log: password, SSN, etc.
    })
    ```

## Getting Help

-   **Documentation**: Check the [wiki](./Home.md) first
-   **GitHub Issues**: Search existing issues before creating new ones
-   **GitHub Discussions**: For questions and general discussion
-   **Code Review**: Tag reviewers for specific expertise areas

Thank you for contributing to FleetFusion! 🚛
