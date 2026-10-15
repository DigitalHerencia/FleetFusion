# Design System — The Maximal Template™

## Purpose

This document describes the visual and presentation intent implemented by the Maximal Template.

The code in `app/globals.css`, `app/layout.tsx`, and the active component library is the practical reference for the current design system.

## Visual character

The application is dark-only.

The intended character is:

- technical;
- industrial;
- dense;
- deliberate;
- sharp;
- modern;
- mature;
- neo-brutalist without cartoon styling.

Avoid turning the interface into a pastel, candy-colored, overly rounded, or toy-like system.

## Root theme

`app/layout.tsx` renders the document in the dark color scheme.

The current font roles are:

```text
display → Archivo Black
body    → JetBrains Mono
code    → Fira Code
```

The root layout also installs `ClerkProvider`.

## Palette

`app/globals.css` owns the semantic color system.

The current palette is intentionally derived from four primary sources:

```text
background
foreground
primary
muted-primary
```

Other semantic colors are aliases or derivations.

The system favors:

- near-black background;
- off-white foreground;
- restrained teal/blue primary;
- muted secondary accent;
- semantic opacity and color-mix derivations.

Avoid introducing unrelated component-local palette literals when the existing semantic system can express the state.

## Geometry

The current system uses:

- square geometry;
- effectively zero global radius;
- visible borders;
- hard shadows;
- compact spacing;
- mechanical interaction.

Button-like controls have a sitewide 3px foreground border invariant.

Do not weaken or selectively bypass that invariant without an explicit design change.

## Shared CSS roles

`app/globals.css` defines reusable composition utilities including:

```text
type-body
type-lead
type-caption
type-label
type-action
type-link
type-title
eyebrow
reading-copy
form-field

surface-card
surface-popover
surface-inset
surface-header
surface-body
surface-footer

control-field
control-action
navigation-item
navigation-active
```

Use these shared roles before creating one-off equivalents.

## Presentation families

The current presentation architecture includes:

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

These categories serve different purposes and should not be collapsed merely for theoretical simplicity.

### UI

`components/ui` owns reusable controls and lower-level UI infrastructure.

### Blocks

`components/blocks` owns reusable composed UI.

Blocks may be interactive and may own local presentation/demo state.

They must not become an application database, authorization, or provider-service layer.

### Templates

`components/templates` owns full-surface presentation compositions.

Templates are a first-class part of the current design system and are used across public and tenant surfaces.

### Features

Features provide the application behavior and data needed by templates, blocks, and controls.

A feature may import a template, a block, or a UI primitive directly when that is how the implemented surface is structured.

Do not require meaningless wrapper layers.

## Auth presentation

The real sign-in/sign-up behavior lives in auth features.

`components/blocks/auth-forms.tsx` provides reusable presentation and local variations.

The feature may inject its own controlled form content while retaining the block's visual shell.

Auth copy is left-aligned and uses the same typography, surface, control, and border system as the rest of the application.

## Navigation

Public and tenant navigation are distinct surfaces.

Tenant navigation belongs to the authenticated application shell.

Do not design tenant navigation around the obsolete assumption that signed-out visitors browse tenant recipes.

Responsive navigation must remain keyboard operable and must preserve meaningful focus behavior.

## Motion

Motion is short and mechanical.

The current shared motion utilities use explicit timing/easing tokens.

Avoid bouncy or decorative spring behavior as a default.

Reduced-motion preferences must be respected.

## Accessibility

Preserve:

- semantic controls;
- keyboard navigation;
- visible focus;
- sufficient contrast;
- readable 16px form inputs;
- touch-usable control sizes;
- status communication that does not rely only on color;
- reduced-motion behavior.

Accessibility regressions are design regressions.

## Content and density

The application may be visually dense, but hierarchy must remain readable.

Prefer:

- clear headings;
- short descriptive copy;
- deliberate grouping;
- compact but usable controls;
- meaningful labels;
- consistent surface treatment.

Do not compensate for weak hierarchy by adding decorative cards or color.

## Governing rule

Visual governance follows the implemented token system and component architecture.

Do not restyle the codebase to satisfy stale prose.

When a design decision is ambiguous, ask the owner before changing the visual system.

## Domain compositions and interactions

The owner requires distinct page compositions matched to business workflows. A shared shell is not a complete domain interface, and repeating a stats row, generic record table, and duplicate summary cards does not satisfy this requirement.

- CRM uses an opportunity stage board, lead qualification queue, contact directory, account profiles, and currency-separated pipeline analysis.
- Projects uses a portfolio, project brief and upcoming-work agenda, status board, task brief and assignment, deadline timeline, and personal priority queue.
- Support uses a triage inbox, persisted conversation, knowledge-article reading/writing, and queue analysis.
- Marketing uses campaign phases, audience rules, planning forms, and lifecycle reporting.
- Invoicing uses itemized invoice entry, a receivables ledger, an invoice document, and an expense ledger/submission flow.
- Social uses a composer with preview, approval/scheduling calendar, and private media library.
- AI uses prompt/output composition, generation history, and recorded usage.
- Portal uses document navigation, private file versions/downloads, client sharing, and billing information.
- Administration uses membership access controls, resource inventory, and chronological audit records. Settings presents actual workspace preferences, members, and integration configuration.

Controls must filter data, navigate, or invoke a real validated operation. Forms must report success only after the server action succeeds. Empty states use actual absence of data, and analytics may not invent trends or provider metrics. Preserve explicit pending, error, and success feedback. Server authorization remains authoritative regardless of control visibility.
