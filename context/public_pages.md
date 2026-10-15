# Public Marketing / Legal Surfaces

### Routes → Features → Templates → Blocks / Workflows

| Route       | Feature / Form | Client Island | Suspense Skeleton | Page Template                                   | Block(s)                                                                                                                                                                                                                                                                   | Workflow File |
| ----------- | -------------- | ------------- | ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `/`         | —              | —             | —                 | `components/templates/landingPageTemplate.tsx`  | `components/blocks/hero-section.tsx`, `components/blocks/logo-cloud.tsx`, `components/blocks/feature-grid.tsx`, `components/blocks/stats-section.tsx`, `components/blocks/comparison-table.tsx`, `components/blocks/testimonials.tsx`, `components/blocks/cta-section.tsx` | —             |
| `/features` | —              | —             | —                 | `components/templates/featuresPageTemplate.tsx` | `components/blocks/hero-section.tsx`, `components/blocks/feature-grid.tsx`, `components/blocks/stats-section.tsx`, `components/blocks/ontology-showcase.tsx`, `components/blocks/comparison-table.tsx`, `components/blocks/cta-section.tsx`                                | —             |
| `/faq`      | —              | —             | —                 | `components/templates/faqPageTemplate.tsx`      | `components/blocks/hero-section.tsx`, `components/blocks/faq-section.tsx`, `components/blocks/cta-section.tsx`                                                                                                                                                             | —             |
| `/terms`    | —              | —             | —                 | `components/templates/termsPageTemplate.tsx`    | `components/blocks/hero-section.tsx`, `components/blocks/legal-document-section.tsx`                                                                                                                                                                                       | —             |
| `/privacy`  | —              | —             | —                 | `components/templates/privacyPageTemplate.tsx`  | `components/blocks/hero-section.tsx`, `components/blocks/legal-document-section.tsx`                                                                                                                                                                                       | —             |

The existing reusable block inventory already contains the hero, logo cloud, feature grid, comparison table, CTA, stats, FAQ, and testimonials blocks; only the ontology-specific showcase and long-form legal document composition need new semantic blocks.

\---

## Landing Page

### Route → Template → Blocks

| Route | Page Template                                  | Existing Block(s)                                                                                                                            |
| ----- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`   | `components/templates/landingPageTemplate.tsx` | `hero-section.tsx`, `logo-cloud.tsx`, `feature-grid.tsx`, `stats-section.tsx`, `comparison-table.tsx`, `testimonials.tsx`, `cta-section.tsx` |

### Target Route File

```text
app/page.tsx
```

### Target Page Template File

```text
components/templates/landingPageTemplate.tsx
```

### Existing Block Files Used

```text
components/blocks/hero-section.tsx
components/blocks/logo-cloud.tsx
components/blocks/feature-grid.tsx
components/blocks/stats-section.tsx
components/blocks/comparison-table.tsx
components/blocks/testimonials.tsx
components/blocks/cta-section.tsx
```

### Route-Owned Public Chrome

The landing page is the deliberate exception to the `(public)` layout. Its route owns the composition of the existing public shell/navigation components directly.

```text
components/shells/public-shell.tsx
components/nav/public-header.tsx
components/nav/public-footer.tsx
components/nav/mobile-bottom-nav.tsx
```

### Target Route Composition

```text
app/page.tsx
└── PublicShell
    ├── PublicHeader
    ├── LandingPageTemplate
    │   ├── HeroSection
    │   ├── LogoCloud
    │   ├── FeatureGrid
    │   ├── StatsSection
    │   ├── ComparisonTable
    │   ├── Testimonials
    │   └── CTASection
    ├── PublicFooter
    └── PublicMobileBottomNav
```

No `features/\*` file, client island, skeleton, fetcher, action, or workflow belongs between this route and its page template.

The current `app/page.tsx` directly imports four blocks, so that file is specifically one of the routes to collapse into the new template boundary.

\---

## Features Page

### Route → Template → Blocks

| Route       | Page Template                                   | Existing Block(s)                                                                                      | New Block(s)            |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------- |
| `/features` | `components/templates/featuresPageTemplate.tsx` | `hero-section.tsx`, `feature-grid.tsx`, `stats-section.tsx`, `comparison-table.tsx`, `cta-section.tsx` | `ontology-showcase.tsx` |

### Target Route File

```text
app/(public)/features/page.tsx
```

### Target Page Template File

```text
components/templates/featuresPageTemplate.tsx
```

### Existing Block Files Used

```text
components/blocks/hero-section.tsx
components/blocks/feature-grid.tsx
components/blocks/stats-section.tsx
components/blocks/comparison-table.tsx
components/blocks/cta-section.tsx
```

### Target Block File Added

```text
components/blocks/ontology-showcase.tsx
```

`ontology-showcase.tsx` is the one justified addition here. It gives the Portfolio-derived page template a reusable block for rendering each supported ontology using the Product-template visual grammar without stuffing product-card JSX into the page template.

The ontology catalog currently defines the nine recipe domains as CRM, Project Management, Customer Support, Marketing Automation, Invoicing, Social Media, AI/Micro-SaaS, B2B Client Portal, and Internal/Admin Tools.

### Target Route Composition

```text
app/(public)/features/page.tsx
└── FeaturesPageTemplate
    ├── HeroSection
    ├── FeatureGrid
    ├── StatsSection
    ├── OntologyShowcase
    │   ├── CRM / Pipeline Tracker
    │   ├── Project Management / Task Tracker
    │   ├── Customer Support / Ticketing
    │   ├── Marketing Automation \& Analytics
    │   ├── Invoicing \& Expense Tracker
    │   ├── Social Media Scheduler
    │   ├── AI-Powered Wrapper / Micro-SaaS
    │   ├── B2B Client Portal
    │   └── Internal Tools / Admin Portal
    ├── ComparisonTable
    └── CTASection
```

### Canonical Ontology Information Source

```text
Ontologies.Canonical-Catalog.md
```

The Product reference supplies the **presentation grammar** for the ontology showcase. It does not create nine ecommerce routes, prices, carts, reviews, or other fake product behavior.

\---

## FAQ Page

### Route → Template → Blocks

| Route  | Page Template                              | Existing Block(s)                                        |
| ------ | ------------------------------------------ | -------------------------------------------------------- |
| `/faq` | `components/templates/faqPageTemplate.tsx` | `hero-section.tsx`, `faq-section.tsx`, `cta-section.tsx` |

### Target Route File

```text
app/(public)/faq/page.tsx
```

### Target Page Template File

```text
components/templates/faqPageTemplate.tsx
```

### Existing Block Files Used

```text
components/blocks/hero-section.tsx
components/blocks/faq-section.tsx
components/blocks/cta-section.tsx
```

The FAQ block is already part of the canonical unchanged block inventory.

### Target Route Composition

```text
app/(public)/faq/page.tsx
└── FAQPageTemplate
    ├── HeroSection
    ├── FAQSection
    └── CTASection
```

The accordion/client interaction remains encapsulated inside `components/blocks/faq-section.tsx` and its UI primitives. There is no public-page `features/faq/\*` client island.

\---

## Terms Page

### Route → Template → Blocks

| Route    | Page Template                                | Existing Block(s)  | New Block(s)                 |
| -------- | -------------------------------------------- | ------------------ | ---------------------------- |
| `/terms` | `components/templates/termsPageTemplate.tsx` | `hero-section.tsx` | `legal-document-section.tsx` |

### Target Route File

```text
app/(public)/terms/page.tsx
```

### Target Page Template File

```text
components/templates/termsPageTemplate.tsx
```

### Existing Block Files Used

```text
components/blocks/hero-section.tsx
```

### Target Block File Added

```text
components/blocks/legal-document-section.tsx
```

### Target Route Composition

```text
app/(public)/terms/page.tsx
└── TermsPageTemplate
    ├── HeroSection
    └── LegalDocumentSection
        ├── Last-updated metadata
        ├── On-this-page navigation
        └── Terms sections
```

`legal-document-section.tsx` should be the shared long-form document composition for both legal routes. No fake FAQ block pretending to be legal prose; the current route does exactly that and should be replaced.

\---

## Privacy Page

### Route → Template → Blocks

| Route      | Page Template                                  | Existing Block(s)  | New Block(s)                 |
| ---------- | ---------------------------------------------- | ------------------ | ---------------------------- |
| `/privacy` | `components/templates/privacyPageTemplate.tsx` | `hero-section.tsx` | `legal-document-section.tsx` |

### Target Route File

```text
app/(public)/privacy/page.tsx
```

### Target Page Template File

```text
components/templates/privacyPageTemplate.tsx
```

### Existing Block Files Used

```text
components/blocks/hero-section.tsx
```

### Shared Target Block File

```text
components/blocks/legal-document-section.tsx
```

### Target Route Composition

```text
app/(public)/privacy/page.tsx
└── PrivacyPageTemplate
    ├── HeroSection
    └── LegalDocumentSection
        ├── Last-updated metadata
        ├── On-this-page navigation
        └── Privacy-policy sections
```

Same architecture as Terms, different document content. The current privacy route also abuses the FAQ simple-list block as placeholder legal presentation, so that disappears.

\---

# Target Route Files

```text
app/page.tsx
app/(public)/features/page.tsx
app/(public)/faq/page.tsx
app/(public)/terms/page.tsx
app/(public)/privacy/page.tsx
```

# Target Feature Files

```text
— none —
```

These are static public presentation routes. There is deliberately no:

```text
features/landing/\*
features/features/\*
features/faq/\*
features/terms/\*
features/privacy/\*
```

# Target Page Template Files

```text
components/templates/landingPageTemplate.tsx
components/templates/featuresPageTemplate.tsx
components/templates/faqPageTemplate.tsx
components/templates/termsPageTemplate.tsx
components/templates/privacyPageTemplate.tsx
```

# Existing Block Files Used

```text
components/blocks/comparison-table.tsx
components/blocks/cta-section.tsx
components/blocks/faq-section.tsx
components/blocks/feature-grid.tsx
components/blocks/hero-section.tsx
components/blocks/logo-cloud.tsx
components/blocks/stats-section.tsx
components/blocks/testimonials.tsx
```

Those filenames are all already present in the canonical shared component inventory.

# Target Block Files Added

```text
components/blocks/ontology-showcase.tsx
components/blocks/legal-document-section.tsx
```

Only two new block abstractions are justified:

```text
ontology-showcase.tsx
└── reusable Product-derived presentation for the nine canonical ontologies

legal-document-section.tsx
└── reusable long-form legal/document presentation shared by Terms and Privacy
```

# Shared Public Layout / Shell Files

```text
app/(public)/layout.tsx
components/shells/public-shell.tsx
components/nav/public-header.tsx
components/nav/public-footer.tsx
components/nav/mobile-bottom-nav.tsx
```

`public-shell.tsx` is already the canonical public shell in the inventory.

The public route-group layout already imports `PublicShell`; that responsibility stays there.

# Canonical Public Presentation Flow

```text
/ landing
app/page.tsx
    ↓
components/templates/landingPageTemplate.tsx
    ↓
components/blocks/\*
    ↓
components/ui/\*


/features
/faq
/terms
/privacy
    ↓
app/(public)/layout.tsx
    ↓
components/shells/public-shell.tsx
    ↓
app/(public)/\*/page.tsx
    ↓
components/templates/\*PageTemplate.tsx
    ↓
components/blocks/\*
    ↓
components/ui/\*
```

# Canonical Server / Schema / Type Files

```text
— none —
```

No public page in this set requires:

```text
lib/actions/\*
lib/fetchers/\*
lib/workflows/\*
lib/db/\*
schemas/\*
types/\*
```
