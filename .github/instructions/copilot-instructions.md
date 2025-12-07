---
description: 'Authoritative coding rules for FleetFusion, tailored to the src/app/[domain] architecture.'
applyTo: '**'
---

# 🚨 FleetFusion AI Coding Standards

**Context:** You are working in a Next.js 16 + Tailwind 4 + Prisma 7 repository.
**Architecture:** Domain-Driven Modular Monolith.

## 1. File Placement Rules (Strict)

When creating or editing files, you MUST follow this map:

| Type              | Location                                      | Naming Convention                  |
| :---------------- | :-------------------------------------------- | :--------------------------------- |
| **Page**          | `src/app/[domain]/page.tsx`                   | `Page`                             |
| **Server Action** | `src/app/[domain]/lib/[domain]Actions.ts`     | `create[Entity]`, `update[Entity]` |
| **Data Fetcher**  | `src/app/[domain]/lib/[domain]Fetchers.ts`    | `get[Entity]`, `list[Entities]`    |
| **Zod Schema**    | `src/app/[domain]/schemas/[domain].schema.ts` | `[entity]Schema`                   |
| **Component**     | `src/app/[domain]/components/[Name].tsx`      | PascalCase                         |
| **Test**          | `src/app/[domain]/tests/[filename].test.ts`   | `[filename].test.ts`               |
| **Hook**          | `src/app/[domain]/lib/[domain]Hooks.ts`       | `use[Feature]`                     |

**NEVER** create files like `src/actions/vehicleActions.ts` or `src/components/VehicleList.tsx` (unless generic). Keep them inside the domain folder.

## 2. Coding Patterns

### Server Actions

```typescript
'use server';
import { z } from 'zod';
import { auth } from '@/lib/server/auth';
import { prisma } from '@/lib/prisma';
import { vehicleSchema } from '../schemas/vehicles.schema';

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
  const { orgId } = await auth.requireOrgContext();

  // 1. Validate
  const parsed = vehicleSchema.parse(data);

  // 2. Mutate
  const vehicle = await prisma.vehicle.create({
    data: { ...parsed, organizationId: orgId },
  });

  // 3. Revalidate
  revalidatePath('/vehicles');
  return vehicle;
}
```

### Data Fetchers

```typescript
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/server/auth';

export async function getVehicles() {
  const { orgId } = await auth.requireOrgContext();

  return prisma.vehicle.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
}
```

## 3. Testing Requirements

- Every Action and Fetcher must have a corresponding test in `tests/`.
- Use `vitest` for unit tests.
- Mock `prisma` and `auth` context in tests.

## 4. Styling (Tailwind 4)

- Use CSS variables defined in `src/app/global.css`.
- Do not use `@apply`. Use utility classes directly.
- Use `shadcn/ui` components from `src/components/ui` for primitives.

## 5. General Rules

- **No `any`**: Use strict TypeScript types.
- **No API Routes**: Use Server Actions.
- **Org Isolation**: ALWAYS filter by `organizationId`.
