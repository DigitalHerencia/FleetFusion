# FleetFusion Design System Specification

**Version:** 2.0  
**Last Updated:** December 4, 2025  
**Status:** Draft

## Goals

- Consistent, accessible UI leveraging Tailwind CSS 4, shadcn/ui, Tailwind Typography, and tailwindcss-animate.
- Dark-first theme aligned with existing brand palette.
- Reusable primitives, tokens, and composition patterns.

## Design Tokens (CSS variables)

```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --card: 240 10% 6%;
  --card-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 190 80% 50%;
  --secondary-foreground: 0 0% 100%;
  --destructive: 0 70% 50%;
  --destructive-foreground: 0 0% 98%;
  --success: 140 60% 45%;
  --warning: 45 90% 50%;
  --radius: 0.75rem;
  --shadow-sm: 0 1px 2px 0 hsl(0 0% 0% / 0.05);
  --shadow-md: 0 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg: 0 10px 15px -3px hsl(0 0% 0% / 0.1);
}
```

## Tailwind 4 Configuration

- Import: `@import "tailwindcss";`
- Plugins: `tailwindcss-animate`, `@tailwindcss/typography`.
- Dark mode: `class` strategy.
- Use CSS variables for colors; avoid custom palette extension when possible.

## shadcn/ui

- Use `rsc: true` generation; base color `neutral`.
- Components curated: Button, Input, Textarea, Select, Dialog, Drawer, Sheet, Tabs, Tooltip, Popover, Dropdown, Toast, Card, Badge, Table, Skeleton.
- Compose domain UIs from primitives; keep business logic outside UI components.

## Typography & Layout

- Font stack: System default with weight contrast; consider custom headline font later.
- Base sizes: 14–16px body, 24–32px hero.
- Prose: Tailwind Typography for docs/help content.
- Spacing scale: 4/8/12/16/20/24/32/40.

## Motion

- Use `tailwindcss-animate` for subtle transitions (fade, slide, accordion).
- Page/section entrances with staggered fade/slide; keep duration 150–250ms.

## Accessibility

- WCAG 2.1 AA contrast; focus rings visible; prefers-reduced-motion respected.
- Hit areas >= 44px; keyboard navigable components.

## Patterns

- **Forms:** Use React Hook Form + Zod; show inline errors; disable submit while pending; optimistic states via `useActionState`.
- **Cards/Surfaces:** Use `card` + `shadow-md`; padding 16–24px.
- **Tables:** Use `@tanstack/react-table`; responsive stacking on mobile; sticky headers for wide sets.
- **Navigation:** Sidebar for tenant app; topbar with org switcher, search, user menu.

## Assets & Branding

- Keep dark background (#0b0d10 equivalent) with blue/cyan accents.
- Icons via Lucide; avoid vendor lock-in.

## Theming API

- Expose CSS variables on `:root`; allow per-tenant overrides in future.
- Provide `ThemeProvider` client component to toggle light/dark if needed.
