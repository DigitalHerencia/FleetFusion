--
applyTo: "\*/\*\*"
--

# LLM AI Coding Partner — Enhanced Instructions

Rules for Modern Fullstack Projects (Next.js 15 Stack)

## General Principles

- **Server-first rendering:** Always default to server-side rendering and data fetching. Use React Server Components (RSC) unless client interactivity is required.
- **Client components:** Only use `"use client"` when local state, event handlers, or browser APIs are necessary.
- **Feature-driven architecture:** Organize code by feature/domain, not by technical type. Ensure scalability and maintainability.
- **Modularity:** Write small, composable, and reusable modules for UI, logic, and data access.

## Project Structure Guidelines

- **app/**: Next.js App Router — routes, pages, layouts, and server components.
- **components/**: Pure, reusable UI components (stateless, no side effects).
- **features/**: Feature modules combining UI and logic (e.g., Editor, Dashboard).
- **lib/**: Domain logic, infrastructure, fetchers, server actions, and utilities.
- **styles/**: Tailwind CSS, global styles, and design tokens.
- **types/**: Shared TypeScript types and interfaces.
- **public/**: Static assets (images, fonts, etc.).
- **config/**: Configuration files (Tailwind, Next.js, PostCSS, etc.).

## Data Fetching

- **Server Components:** Fetch and render data on the server by default.
- **Client-only data:** Use `useEffect` only for browser-specific or client-only data.
- **Fetcher location:** Place shared fetch logic in `lib/fetchers/*.ts`, colocated by domain (e.g., `lib/fetchers/vehicles.ts`).
- **Async fetchers:** All fetch functions must be async and typed.
- **No duplicate fetchers:** Reuse fetchers across components and actions.

## Mutations & Forms

- **React 19 Server Actions:** Place all mutations in `lib/actions/*.ts` with `'use server'` directive.
- **Exported actions:** Use `export async function actionName(data: FormData | object) { ... }`.
- **Usage patterns:**
  - In server components: `Save`
  - In client components: `...`
  - Direct invocation: `await actionFn()`
- **Form state:** Use `useActionState()` and `useFormStatus()` for managing form state, validation, and errors.
- **Validation:** Always validate inputs using Zod or equivalent schemas before mutation.

## API Routes

- **Use `/app/api/*` only for:**
  - Authentication (sign-in, sign-out, etc.)
  - Webhooks (e.g., Clerk, Stripe)- 3rd-party integrations- Public APIs (never for internal CRUD)
- **CRUD and business logic:** Implement via Server Actions, not API routes.

## Tailwind CSS 4

- **Import:** Use `@import "tailwindcss"` in `globals.css`.
- **Design tokens:** Define CSS variables (e.g., `--color`, `--radius`) in `:root`.
- **Theme extension:** Avoid extending Tailwind config with custom colors; use `hsl(var(--token))`
  utilities.
- **Dark mode:** Enable with `darkMode: 'class'` in Tailwind config.- **No excessive overrides:** Prefer CSS variables and utility classes over custom CSS.

## React 19 Usage

- **Optimistic UI:** Use `useOptimistic()` for previews and fast form feedback.
- **Async transitions:** Use `useTransition()` for async state and UI transitions.
- **Server Actions:** Combine with `useOptimistic()` and `useTransition()` for best UX.
- **Data loading:** Prefer `use()` for loading data in server components.

## TypeScript 5 Best Practices

- **Config validation:** Use `satisfies` to validate config objects.
- **Strictness:** Enable `strict` mode and use `as const` for literals.
- **Type inference:** Prefer type inference and utility types (`infer`, tuples).
- **Decorators:** Use `@decorators` only for advanced class/utility logic.
- **No `any`:** Avoid `any` and unsafe type assertions.

## Testing & Maintainability

- **Reusable code:** Write fetchers, actions, and UI components for reuse.
- **Separation of concerns:** UI in `components/`, logic in `lib/`, pages in `app/`.
- **Tailwind:** Avoid over-customizing Tailwind; use CSS-first theming.
- **Documentation:** Document all systems, flows, and configs. Update docs after significant changes.
- **Testing:** Write unit and integration tests for all critical logic and flows.

## Production Readiness

- **Complete code:** Always generate production-ready, complete code. No mock data, stubs, or simulated logic.
- **Business logic:** Implement full business logic, input validation, and error handling.
- **Imports and types:** Include all required imports, types, and configuration.
- **Documentation:** Add minimal inline comments where helpful.
- **File edits:** Apply edits to the correct files. Complete each assigned task exhaustively before
  proceeding.
- **Validation:** Ensure all flows are validated and tested before marking as complete.

---

## Rule: Always Use Async Params Pattern in Next.js 15

- **CORRECT Pattern (Next.js 15+)**

```typescript
// Method 1: Inline Type Definition
export default async function Page({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  // ... rest of component
}
// Method 2: Interface Definition
interface PageProps {
  params: Promise<{
    orgId: string;
    userId?: string;
  }>;
}
export default async function Page({ params }: PageProps) {
  const { orgId, userId } = await params;
  // ... rest of component
}
```

## Additional Guidelines

- When generating new files, follow the established naming and structure conventions.
- For workflows involving GitHub, Vercel, or CI/CD, ensure all configuration and automation is production-ready and secure.
- For diagrams or visualizations, use Mermaid syntax and reference the appropriate context files.

---
