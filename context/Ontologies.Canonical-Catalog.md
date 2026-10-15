---
title: The Ontology™ Normalized Defaults — Canonical Catalog
type: architecture-catalog
scope: application-definition
project: Codependent Coding
domain: ontologies
artifact: canonical-file-inventory
namespace: codependentcoding.ontologies.catalog
status: active
authority: canonical-index
parent: codependentcoding.ontologies.authoritative
created: 2026-08-22
updated: 2026-09-08
alignment: codebase-first
implementation_root: template/
implementation_branch: main
---

# The Ontology™ Normalized Defaults — Canonical Catalog

This catalog records the normalized ontology inventory that is **actually implemented** in `template/` on `main`.

The implementation is the baseline for this document. This catalog does not prescribe a different architecture, create missing files, preserve obsolete stubs, or require the codebase to conform to an older ontology model.

## Catalog rules

- Only files and routes observed in the current codebase are canonical inventory entries.
- A missing file is not represented as `[STUB — BUILD]`.
- Existing consolidated files are recorded as consolidated files; they are not expanded into hypothetical per-operation files.
- Route groups such as `app/(tenant)` are implementation structure, not URL segments.
- Dedicated form components are recorded as route entrypoints when the route renders them directly.
- Domain-specific templates are recorded by their actual filenames.
- `components/templates/` is a first-class presentation layer.
- `components/blocks/` contains reusable presentation compositions. It is not a second business-logic namespace.
- Business/application orchestration lives under `lib/workflows/` in the current codebase.
- Authorization is centralized under `lib/authz/`; this catalog does not invent per-domain authz files.
- Provider adapters are cross-cutting under `lib/integrations/` and are not assigned to an ontology solely by name.

## Implemented relationship model

The current application uses these observed paths:

```text
Route → server Feature → domain Template → shared presentation Block/UI
Route → client Form → UI primitives

Feature → Workflow / Fetcher
Workflow → Fetcher / Action
Action / Fetcher → DB selects / DTOs / transactions

Shared authorization → lib/authz/
Shared provider adapters → lib/integrations/
Shared design system → app/globals.css + component library
```

The prior `PureUI Blocks + BusinessLogic Blocks` inventory is not used here because the current repository does not implement `BusinessLogic Blocks` as a file family. Presentation blocks and server workflows are separate implemented categories.

## Domain workflow implementation

The owner-directed domain correction on 2026-09-08 replaces the uniform stats/table/summary composition and command echoes. Create/edit forms persist through domain actions, with identity, permission, tenant, schema, and concurrency checks at server boundaries. Search controls filter the loaded data; bounded lists do not imply full-dataset search.

Provider behavior remains explicit: AI generation invokes the existing inference endpoint; workspace files use private Vercel Blob storage; social approval and scheduling persist queue state. Campaign lifecycle controls update planning state and do not send marketing messages. Invoice issuance records an approved invoice as open without emailing or charging a customer. Live provider operation requires separate runtime evidence.

## Shared implemented presentation inventory

### Reusable blocks currently present

```text
components/blocks/auth-forms.tsx
components/blocks/bento-grid.tsx
components/blocks/changelog-section.tsx
components/blocks/comparison-table.tsx
components/blocks/contact-section.tsx
components/blocks/cta-section.tsx
components/blocks/dashboard-layout.tsx
components/blocks/error-pages.tsx
components/blocks/faq-section.tsx
components/blocks/feature-grid.tsx
components/blocks/footer-section.tsx
components/blocks/hero-section.tsx
components/blocks/invoice.tsx
components/blocks/legal-document-section.tsx
components/blocks/logo-cloud.tsx
components/blocks/onboarding-flow.tsx
components/blocks/ontology-showcase.tsx
components/blocks/pricing-section.tsx
components/blocks/settings-page.tsx
components/blocks/stats-section.tsx
components/blocks/team-section.tsx
components/blocks/testimonials.tsx
```

`components/blocks/dashboard-layout.tsx` supplies shared page framing, panels, and tables. Domain templates own workflow-specific compositions: opportunity stages, lead qualification, project delivery, task boards and agendas, support conversations, campaign phases, itemized invoices, publishing dates, AI prompt/output, document versions, and member administration. Dedicated form components compose `components/ui/*` directly and invoke validated server actions.

### Shared authorization

```text
lib/authz/permissions.ts
lib/authz/policies.ts
lib/authz/resources.ts
lib/authz/roles.ts
```

### Shared helpers

```text
lib/cache/invalidate.ts
lib/cache/life.ts
lib/cache/tags.ts

lib/constants/limits.ts
lib/constants/pagination.ts

lib/utils/chartExport.ts
lib/utils/cn.ts
lib/utils/dates.ts
lib/utils/mathCurves.ts
lib/utils/money.ts
lib/utils/motionCore.ts
lib/utils/strings.ts
```

The repository does not currently contain the older catalog's domain-specific `crmCache.ts`, `projectsConstants.ts`, `supportParams.ts`, or equivalent symmetry files.

# Canonical Ontology File Inventory

## 1. CRM / Pipeline Tracker Ontology™

### Routes → implemented entrypoints → templates

| Route                            | Implemented entrypoint                     | Template                                            |
| -------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| `/crm/pipeline`                  | `features/crm/crmPipelineFeature.tsx`      | `components/templates/crmPipelineTemplate.tsx`      |
| `/crm/leads`                     | `features/crm/crmLeadsFeature.tsx`         | `components/templates/crmLeadsTemplate.tsx`         |
| `/crm/leads/new`                 | `features/crm/crmNewLeadForm.tsx`          | —                                                   |
| `/crm/leads/[leadId]`            | `features/crm/crmLeadDetailFeature.tsx`    | `components/templates/crmLeadDetailTemplate.tsx`    |
| `/crm/leads/[leadId]/edit`       | `features/crm/crmEditLeadForm.tsx`         | —                                                   |
| `/crm/contacts`                  | `features/crm/crmContactsFeature.tsx`      | `components/templates/crmContactsTemplate.tsx`      |
| `/crm/contacts/new`              | `features/crm/crmNewContactForm.tsx`       | —                                                   |
| `/crm/contacts/[contactId]`      | `features/crm/crmContactDetailFeature.tsx` | `components/templates/crmContactDetailTemplate.tsx` |
| `/crm/contacts/[contactId]/edit` | `features/crm/crmEditContactForm.tsx`      | —                                                   |
| `/crm/accounts`                  | `features/crm/crmAccountsFeature.tsx`      | `components/templates/crmAccountsTemplate.tsx`      |
| `/crm/accounts/new`              | `features/crm/crmNewAccountForm.tsx`       | —                                                   |
| `/crm/accounts/[accountId]`      | `features/crm/crmAccountDetailFeature.tsx` | `components/templates/crmAccountDetailTemplate.tsx` |
| `/crm/accounts/[accountId]/edit` | `features/crm/crmEditAccountForm.tsx`      | —                                                   |
| `/crm/analytics`                 | `features/crm/crmAnalyticsFeature.tsx`     | `components/templates/crmAnalyticsTemplate.tsx`     |

### `crm` feature inventory

```text
features/crm/crmAccountDetailFeature.tsx
features/crm/crmAccountDetailSkeleton.tsx
features/crm/crmAccountsFeature.client.tsx
features/crm/crmAccountsFeature.tsx
features/crm/crmAccountsSkeleton.tsx
features/crm/crmAnalyticsFeature.tsx
features/crm/crmAnalyticsSkeleton.tsx
features/crm/crmContactDetailFeature.tsx
features/crm/crmContactDetailSkeleton.tsx
features/crm/crmContactsFeature.client.tsx
features/crm/crmContactsFeature.tsx
features/crm/crmContactsSkeleton.tsx
features/crm/crmEditAccountForm.tsx
features/crm/crmEditContactForm.tsx
features/crm/crmEditLeadForm.tsx
features/crm/crmLeadDetailFeature.tsx
features/crm/crmLeadDetailSkeleton.tsx
features/crm/crmLeadsFeature.tsx
features/crm/crmLeadsSkeleton.tsx
features/crm/crmNewAccountForm.tsx
features/crm/crmNewContactForm.tsx
features/crm/crmNewLeadForm.tsx
features/crm/crmOpportunityForm.client.tsx
features/crm/crmPipelineFeature.client.tsx
features/crm/crmPipelineFeature.tsx
features/crm/crmPipelineSkeleton.tsx
```

### `crm` template inventory

```text
components/templates/crmAccountDetailTemplate.tsx
components/templates/crmAccountsTemplate.tsx
components/templates/crmAnalyticsTemplate.tsx
components/templates/crmContactDetailTemplate.tsx
components/templates/crmContactsTemplate.tsx
components/templates/crmLeadDetailTemplate.tsx
components/templates/crmLeadsTemplate.tsx
components/templates/crmPipelineTemplate.tsx
```

### `crm` server/application inventory

```text
lib/actions/crmActions.ts
lib/fetchers/crmFetchers.ts
lib/workflows/crmWorkflows.ts

lib/db/selects/crm.selects.ts
lib/db/dto/crm.dto.ts
lib/db/transactions/assign-crm-record.tx.ts
lib/db/transactions/record-sales-activity.tx.ts
lib/db/transactions/update-deal-stage.tx.ts

schemas/crmSchemas.ts
types/crmTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 2. Project Management / Task Tracker Ontology™

### Routes → implemented entrypoints → templates

| Route                                       | Implemented entrypoint                  | Template                                             |
| ------------------------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `/projects`                                 | `features/projects/projectsFeature.tsx` | `components/templates/projectsTemplate.tsx`          |
| `/projects/new`                             | `features/projects/projectNewForm.tsx`  | —                                                    |
| `/projects/[projectId]`                     | `features/projects/projectFeature.tsx`  | `components/templates/projectDetailTemplate.tsx`     |
| `/projects/[projectId]/edit`                | `features/projects/projectEditForm.tsx` | —                                                    |
| `/projects/[projectId]/tasks`               | `features/projects/tasksFeature.tsx`    | `components/templates/projectTasksTemplate.tsx`      |
| `/projects/[projectId]/tasks/new`           | `features/projects/taskNewForm.tsx`     | —                                                    |
| `/projects/[projectId]/tasks/[taskId]`      | `features/projects/taskFeature.tsx`     | `components/templates/projectTaskDetailTemplate.tsx` |
| `/projects/[projectId]/tasks/[taskId]/edit` | `features/projects/taskEditForm.tsx`    | —                                                    |
| `/projects/[projectId]/timeline`            | `features/projects/timelineFeature.tsx` | `components/templates/projectTimelineTemplate.tsx`   |
| `/my-tasks`                                 | `features/projects/myTasksFeature.tsx`  | `components/templates/myTasksTemplate.tsx`           |

### `projects` feature inventory

```text
features/projects/myTasksFeature.tsx
features/projects/myTasksSkeleton.tsx
features/projects/projectEditForm.tsx
features/projects/projectFeature.tsx
features/projects/projectNewForm.tsx
features/projects/projectSkeleton.tsx
features/projects/projectsFeature.client.tsx
features/projects/projectsFeature.tsx
features/projects/projectsSkeleton.tsx
features/projects/taskEditForm.tsx
features/projects/taskFeature.client.tsx
features/projects/taskFeature.tsx
features/projects/taskNewForm.tsx
features/projects/taskSkeleton.tsx
features/projects/tasksFeature.client.tsx
features/projects/tasksFeature.tsx
features/projects/tasksSkeleton.tsx
features/projects/timelineFeature.tsx
features/projects/timelineSkeleton.tsx
```

### `projects` template inventory

```text
components/templates/myTasksTemplate.tsx
components/templates/projectDetailTemplate.tsx
components/templates/projectTaskDetailTemplate.tsx
components/templates/projectTasksTemplate.tsx
components/templates/projectTimelineTemplate.tsx
components/templates/projectsTemplate.tsx
```

### `projects` server/application inventory

```text
lib/actions/projectsActions.ts
lib/fetchers/projectsFetchers.ts
lib/workflows/projectsWorkflows.ts

lib/db/selects/projects.selects.ts
lib/db/dto/projects.dto.ts
lib/db/transactions/projects.tx.ts
lib/db/transactions/update-task-status.tx.ts

schemas/projectsSchemas.ts
types/projectsTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 3. Customer Support / Ticketing System Ontology™

### Routes → implemented entrypoints → templates

| Route                                      | Implemented entrypoint                          | Template                                                   |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| `/support/inbox`                           | `features/support/inboxFeature.tsx`             | `components/templates/supportInboxTemplate.tsx`            |
| `/support/tickets/new`                     | `features/support/ticketNewForm.tsx`            | —                                                          |
| `/support/tickets/[ticketId]`              | `features/support/ticketFeature.tsx`            | `components/templates/supportTicketTemplate.tsx`           |
| `/support/knowledge-base`                  | `features/support/knowledgeBaseFeature.tsx`     | `components/templates/supportKnowledgeBaseTemplate.tsx`    |
| `/support/knowledge-base/new`              | `features/support/knowledgeArticleNewForm.tsx`  | —                                                          |
| `/support/knowledge-base/[articleId]`      | `features/support/knowledgeArticleFeature.tsx`  | `components/templates/supportKnowledgeArticleTemplate.tsx` |
| `/support/knowledge-base/[articleId]/edit` | `features/support/knowledgeArticleEditForm.tsx` | —                                                          |
| `/support/analytics`                       | `features/support/supportAnalyticsFeature.tsx`  | `components/templates/supportAnalyticsTemplate.tsx`        |

### `support` feature inventory

```text
features/support/inboxFeature.client.tsx
features/support/inboxFeature.tsx
features/support/inboxSkeleton.tsx
features/support/knowledgeArticleEditForm.tsx
features/support/knowledgeArticleFeature.tsx
features/support/knowledgeArticleNewForm.tsx
features/support/knowledgeArticleSkeleton.tsx
features/support/knowledgeBaseFeature.client.tsx
features/support/knowledgeBaseFeature.tsx
features/support/knowledgeBaseSkeleton.tsx
features/support/supportAnalyticsFeature.tsx
features/support/supportAnalyticsSkeleton.tsx
features/support/ticketFeature.client.tsx
features/support/ticketFeature.tsx
features/support/ticketNewForm.tsx
features/support/ticketSkeleton.tsx
```

### `support` template inventory

```text
components/templates/supportAnalyticsTemplate.tsx
components/templates/supportInboxTemplate.tsx
components/templates/supportKnowledgeArticleTemplate.tsx
components/templates/supportKnowledgeBaseTemplate.tsx
components/templates/supportTicketTemplate.tsx
```

### `support` server/application inventory

```text
lib/actions/supportActions.ts
lib/fetchers/supportFetchers.ts
lib/workflows/supportWorkflows.ts

lib/db/selects/support.selects.ts
lib/db/dto/support.dto.ts
lib/db/transactions/support.tx.ts
lib/db/transactions/update-ticket-status.tx.ts

schemas/supportSchemas.ts
types/supportTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 4. Marketing Automation & Analytics Ontology™

### Routes → implemented entrypoints → templates

| Route                                    | Implemented entrypoint                             | Template                                                   |
| ---------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `/marketing/campaigns`                   | `features/marketing/campaignsFeature.tsx`          | `components/templates/marketingCampaignsTemplate.tsx`      |
| `/marketing/campaigns/new`               | `features/marketing/campaignNewForm.tsx`           | —                                                          |
| `/marketing/campaigns/[campaignId]`      | `features/marketing/campaignFeature.tsx`           | `components/templates/marketingCampaignDetailTemplate.tsx` |
| `/marketing/campaigns/[campaignId]/edit` | `features/marketing/campaignEditForm.tsx`          | —                                                          |
| `/marketing/audiences`                   | `features/marketing/audiencesFeature.tsx`          | `components/templates/marketingAudiencesTemplate.tsx`      |
| `/marketing/audiences/new`               | `features/marketing/audienceNewForm.tsx`           | —                                                          |
| `/marketing/audiences/[audienceId]`      | `features/marketing/audienceFeature.tsx`           | `components/templates/marketingAudienceDetailTemplate.tsx` |
| `/marketing/audiences/[audienceId]/edit` | `features/marketing/audienceEditForm.tsx`          | —                                                          |
| `/marketing/analytics`                   | `features/marketing/marketingAnalyticsFeature.tsx` | `components/templates/marketingAnalyticsTemplate.tsx`      |

### `marketing` feature inventory

```text
features/marketing/audienceEditForm.tsx
features/marketing/audienceFeature.tsx
features/marketing/audienceNewForm.tsx
features/marketing/audienceSkeleton.tsx
features/marketing/audiencesFeature.client.tsx
features/marketing/audiencesFeature.tsx
features/marketing/audiencesSkeleton.tsx
features/marketing/campaignEditForm.tsx
features/marketing/campaignFeature.client.tsx
features/marketing/campaignFeature.tsx
features/marketing/campaignNewForm.tsx
features/marketing/campaignForm.client.tsx
features/marketing/campaignSkeleton.tsx
features/marketing/campaignsFeature.client.tsx
features/marketing/campaignsFeature.tsx
features/marketing/campaignsSkeleton.tsx
features/marketing/marketingAnalyticsFeature.tsx
features/marketing/marketingAnalyticsSkeleton.tsx
```

### `marketing` template inventory

```text
components/templates/marketingAnalyticsTemplate.tsx
components/templates/marketingAudienceDetailTemplate.tsx
components/templates/marketingAudiencesTemplate.tsx
components/templates/marketingCampaignDetailTemplate.tsx
components/templates/marketingCampaignsTemplate.tsx
```

### `marketing` server/application inventory

```text
lib/actions/marketingActions.ts
lib/fetchers/marketingFetchers.ts
lib/workflows/marketingWorkflows.ts

lib/db/selects/marketing.selects.ts
lib/db/dto/marketing.dto.ts
lib/db/transactions/marketing.tx.ts

schemas/marketingSchemas.ts
types/marketingTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 5. Invoicing & Expense Tracker Ontology™

### Routes → implemented entrypoints → templates

| Route                        | Implemented entrypoint                   | Template                                                  |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `/invoices`                  | `features/invoicing/invoicesFeature.tsx` | `components/templates/invoicingInvoicesTemplate.tsx`      |
| `/invoices/new`              | `features/invoicing/invoiceNewForm.tsx`  | —                                                         |
| `/invoices/[invoiceId]`      | `features/invoicing/invoiceFeature.tsx`  | `components/templates/invoicingInvoiceDetailTemplate.tsx` |
| `/invoices/[invoiceId]/edit` | `features/invoicing/invoiceEditForm.tsx` | —                                                         |
| `/expenses`                  | `features/invoicing/expensesFeature.tsx` | `components/templates/invoicingExpensesTemplate.tsx`      |
| `/expenses/new`              | `features/invoicing/expenseNewForm.tsx`  | —                                                         |
| `/expenses/[expenseId]`      | `features/invoicing/expenseFeature.tsx`  | `components/templates/invoicingExpenseDetailTemplate.tsx` |
| `/expenses/[expenseId]/edit` | `features/invoicing/expenseEditForm.tsx` | —                                                         |

### `invoicing` feature inventory

```text
features/invoicing/expenseEditForm.tsx
features/invoicing/expenseFeature.tsx
features/invoicing/expenseNewForm.tsx
features/invoicing/expenseSkeleton.tsx
features/invoicing/expensesFeature.client.tsx
features/invoicing/expensesFeature.tsx
features/invoicing/expensesSkeleton.tsx
features/invoicing/invoiceEditForm.tsx
features/invoicing/invoiceFeature.client.tsx
features/invoicing/invoiceFeature.tsx
features/invoicing/invoiceNewForm.tsx
features/invoicing/invoiceSkeleton.tsx
features/invoicing/invoicesFeature.client.tsx
features/invoicing/invoicesFeature.tsx
features/invoicing/invoicesSkeleton.tsx
```

### `invoicing` template inventory

```text
components/templates/invoicingExpenseDetailTemplate.tsx
components/templates/invoicingExpensesTemplate.tsx
components/templates/invoicingInvoiceDetailTemplate.tsx
components/templates/invoicingInvoicesTemplate.tsx
```

### `invoicing` server/application inventory

```text
lib/actions/invoicingActions.ts
lib/fetchers/invoicingFetchers.ts
lib/workflows/invoicingWorkflows.ts

lib/db/selects/invoicing.selects.ts
lib/db/dto/invoicing.dto.ts
lib/db/transactions/create-invoice.tx.ts
lib/db/transactions/invoicing.tx.ts
lib/db/transactions/update-invoice-status.tx.ts

schemas/invoicingSchemas.ts
types/invoicingTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 6. Social Media Scheduler Ontology™

### Routes → implemented entrypoints → templates

| Route              | Implemented entrypoint                    | Template                                          |
| ------------------ | ----------------------------------------- | ------------------------------------------------- |
| `/social/calendar` | `features/social/calendarFeature.tsx`     | `components/templates/socialCalendarTemplate.tsx` |
| `/social/compose`  | `features/social/composerFeature.tsx`     | `components/templates/socialComposeTemplate.tsx`  |
| `/social/media`    | `features/social/mediaLibraryFeature.tsx` | `components/templates/socialMediaTemplate.tsx`    |

### `social` feature inventory

```text
features/social/calendarFeature.client.tsx
features/social/calendarFeature.tsx
features/social/calendarSkeleton.tsx
features/social/composerFeature.client.tsx
features/social/composerFeature.tsx
features/social/composerSkeleton.tsx
features/social/mediaAssetControls.client.tsx
features/social/mediaLibraryFeature.client.tsx
features/social/mediaLibraryFeature.tsx
features/social/mediaLibrarySkeleton.tsx
```

### `social` template inventory

```text
components/templates/socialCalendarTemplate.tsx
components/templates/socialComposeTemplate.tsx
components/templates/socialMediaTemplate.tsx
```

### `social` server/application inventory

```text
lib/actions/socialActions.ts
lib/fetchers/socialFetchers.ts
lib/workflows/socialWorkflows.ts

lib/db/selects/social.selects.ts
lib/db/dto/social.dto.ts
lib/db/transactions/schedule-social-post.tx.ts
lib/db/transactions/social.tx.ts

schemas/socialSchemas.ts
types/socialTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 7. AI-Powered Wrapper / Micro-SaaS Ontology™

### Routes → implemented entrypoints → templates

| Route            | Implemented entrypoint                | Template                                        |
| ---------------- | ------------------------------------- | ----------------------------------------------- |
| `/ai`            | `features/ai/aiGenerationFeature.tsx` | `components/templates/aiGenerationTemplate.tsx` |
| `/ai/playground` | `features/ai/aiPlaygroundFeature.tsx` | `components/templates/aiPlaygroundTemplate.tsx` |
| `/ai/usage`      | `features/ai/aiUsageFeature.tsx`      | `components/templates/aiUsageTemplate.tsx`      |

### `ai` feature inventory

```text
features/ai/aiGenerationFeature.tsx
features/ai/aiGenerationSkeleton.tsx
features/ai/aiPlaygroundFeature.client.tsx
features/ai/aiPlaygroundFeature.tsx
features/ai/aiPlaygroundSkeleton.tsx
features/ai/aiUsageFeature.tsx
features/ai/aiUsageSkeleton.tsx
```

### `ai` template inventory

```text
components/templates/aiGenerationTemplate.tsx
components/templates/aiPlaygroundTemplate.tsx
components/templates/aiUsageTemplate.tsx
```

### `ai` server/application inventory

```text
lib/actions/aiActions.ts
lib/fetchers/aiFetchers.ts
lib/workflows/aiWorkflows.ts

lib/db/selects/ai.selects.ts
lib/db/dto/ai.dto.ts
lib/db/transactions/ai.tx.ts
lib/db/transactions/complete-ai-generation.tx.ts

schemas/aiSchemas.ts
types/aiTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 8. B2B Client Portal Ontology™

### Routes → implemented entrypoints → templates

| Route                            | Implemented entrypoint                 | Template                                                |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| `/portal`                        | `features/portal/portalFeature.tsx`    | `components/templates/portalHomeTemplate.tsx`           |
| `/portal/documents`              | `features/portal/documentsFeature.tsx` | `components/templates/portalDocumentsTemplate.tsx`      |
| `/portal/documents/[documentId]` | `features/portal/documentFeature.tsx`  | `components/templates/portalDocumentDetailTemplate.tsx` |
| `/portal/billing`                | `features/portal/billingFeature.tsx`   | `components/templates/portalBillingTemplate.tsx`        |

### `portal` feature inventory

```text
features/portal/billingFeature.tsx
features/portal/billingSkeleton.tsx
features/portal/portalDocumentControls.client.tsx
features/portal/workspaceFileUpload.client.tsx
features/portal/documentFeature.client.tsx
features/portal/documentFeature.tsx
features/portal/documentSkeleton.tsx
features/portal/documentsFeature.client.tsx
features/portal/documentsFeature.tsx
features/portal/documentsSkeleton.tsx
features/portal/portalFeature.tsx
features/portal/portalSkeleton.tsx
```

### `portal` template inventory

```text
components/templates/portalBillingTemplate.tsx
components/templates/portalDocumentDetailTemplate.tsx
components/templates/portalDocumentsTemplate.tsx
components/templates/portalHomeTemplate.tsx
```

### `portal` server/application inventory

```text
lib/actions/portalActions.ts
lib/fetchers/portalFetchers.ts
lib/workflows/portalWorkflows.ts
lib/workflows/assetWorkflows.ts

lib/db/selects/portal.selects.ts
lib/db/dto/portal.dto.ts
lib/db/transactions/add-portal-version.tx.ts
lib/db/transactions/portal.tx.ts

schemas/portalSchemas.ts
types/portalTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

## 9. Internal Tools / Admin Portal Ontology™

### Routes → implemented entrypoints → templates

| Route                        | Implemented entrypoint                        | Template                                             |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `/admin/records`             | `features/admin/adminRecordsFeature.tsx`      | `components/templates/adminRecordsTemplate.tsx`      |
| `/admin/records/[recordId]`  | `features/admin/adminRecordDetailFeature.tsx` | `components/templates/adminRecordDetailTemplate.tsx` |
| `/admin/users`               | `features/admin/adminUsersFeature.tsx`        | `components/templates/adminUsersTemplate.tsx`        |
| `/admin/users/new`           | `features/admin/adminNewUserForm.tsx`         | —                                                    |
| `/admin/users/[userId]`      | `features/admin/adminUserDetailFeature.tsx`   | `components/templates/adminUserDetailTemplate.tsx`   |
| `/admin/users/[userId]/edit` | `features/admin/adminEditUserForm.tsx`        | —                                                    |
| `/admin/audit`               | `features/admin/adminAuditFeature.tsx`        | `components/templates/adminAuditTemplate.tsx`        |

### `admin` feature inventory

```text
features/admin/adminAuditFeature.client.tsx
features/admin/adminAuditFeature.tsx
features/admin/adminAuditSkeleton.tsx
features/admin/adminEditUserForm.tsx
features/admin/adminNewUserForm.tsx
features/admin/adminRecordDetailFeature.tsx
features/admin/adminRecordDetailSkeleton.tsx
features/admin/adminRecordsFeature.tsx
features/admin/adminRecordsSkeleton.tsx
features/admin/adminUserDetailFeature.client.tsx
features/admin/adminUserDetailFeature.tsx
features/admin/adminUserDetailSkeleton.tsx
features/admin/adminUsersFeature.client.tsx
features/admin/adminUsersFeature.tsx
features/admin/adminUsersSkeleton.tsx
```

### `admin` template inventory

```text
components/templates/adminAuditTemplate.tsx
components/templates/adminRecordDetailTemplate.tsx
components/templates/adminRecordsTemplate.tsx
components/templates/adminUserDetailTemplate.tsx
components/templates/adminUsersTemplate.tsx
```

### `admin` server/application inventory

```text
lib/actions/adminActions.ts
lib/fetchers/adminFetchers.ts
lib/workflows/adminWorkflows.ts

lib/db/selects/admin.selects.ts
lib/db/dto/admin.dto.ts
lib/db/transactions/admin.tx.ts

schemas/adminSchemas.ts
types/adminTypes.ts
```

Authorization for this ontology uses the shared `lib/authz/` files listed above rather than ontology-specific permission/policy files.

---

# Cross-Cutting Integration Inventory

Provider adapters are shared implementation infrastructure. They are listed once here instead of being duplicated into ontology sections without direct import evidence.

```text
lib/integrations/status.ts

lib/integrations/cloudinary/client.ts
lib/integrations/cloudinary/transformations.ts
lib/integrations/cloudinary/upload.ts

lib/integrations/hugging-face/client.ts
lib/integrations/hugging-face/embeddings.ts
lib/integrations/hugging-face/inference.ts

lib/integrations/sendgrid/client.ts
lib/integrations/sendgrid/email.ts
lib/integrations/sendgrid/webhooks.ts

lib/integrations/stripe/checkout.ts
lib/integrations/stripe/client.ts
lib/integrations/stripe/portal.ts
lib/integrations/stripe/subscriptions.ts
lib/integrations/stripe/webhooks.ts

lib/integrations/vercel-blob/client.ts
lib/integrations/vercel-blob/delete.ts
lib/integrations/vercel-blob/upload.ts
```

Current provider-facing Route Handler families include:

```text
app/api/ai/generate/route.ts
app/api/clerk/webhooks/route.ts
app/api/sendgrid/webhooks/route.ts
app/api/stripe/webhooks/route.ts
```

# Shared Database Runtime

```text
lib/db/client.ts
lib/db/provider.ts
lib/db/tenant.ts
```

Additional cross-cutting transactions currently include:

```text
lib/db/transactions/clerk-user.tx.ts
lib/db/transactions/errors.ts
lib/db/transactions/idempotency.tx.ts
lib/db/transactions/onboarding.tx.ts
lib/db/transactions/webhook-event.tx.ts
```

# Shared Schema and Type Inventory

Cross-cutting schema files:

```text
schemas/commonSchemas.ts
schemas/integrationSchemas.ts
```

Cross-cutting type files:

```text
types/access.ts
types/commonTypes.ts
types/integrationTypes.ts
types/uiTypes.ts
```

The older `types/*Interfaces.ts` family is not present in the current repository and is therefore not part of this catalog.

# Design-System Sources

The implemented global design system is sourced from:

```text
app/globals.css
app/layout.tsx
```

Chart-specific palettes live at:

```text
components/chart/palettes.ts
```

`components/ui/palettes.ts` is not present in the current codebase and is not canonical.

# Explicitly Removed Obsolete Inventory Assumptions

This revision intentionally removes the following older catalog assumptions because the corresponding implementation is not present:

- generic `DataGridTemplate.tsx`, `WorkspaceTemplate.tsx`, `FormTemplate.tsx`, `ProfileTemplate.tsx`, `DashboardTemplate.tsx`, `BillingTemplate.tsx`, `DocsTemplate.tsx`, `AdminTemplate.tsx`, `StepperTemplate.tsx`, and `CalanderTemplate.tsx` files;
- ontology-specific `[STUB — BUILD]` block files such as `kanban-board.tsx`, `data-table-section.tsx`, `record-detail-section.tsx`, `activity-timeline.tsx`, `analytics-dashboard.tsx`, `support-inbox.tsx`, `ticket-workspace.tsx`, `knowledge-base.tsx`, `campaign-workflow.tsx`, `social-calendar.tsx`, `post-composer.tsx`, `media-library.tsx`, `ai-chat-workspace.tsx`, `ai-playground.tsx`, `usage-dashboard.tsx`, `file-vault.tsx`, `approval-panel.tsx`, and admin-specific stub blocks;
- per-operation action/fetcher/workflow directory trees that were replaced by consolidated domain files in the actual repository;
- per-domain authz files that do not exist;
- domain-specific cache/constants/params symmetry files that do not exist;
- `types/*Interfaces.ts` files that do not exist;
- routes that are absent from the current route tree, including the older CRM deals/activities/settings surfaces, project milestones surface, social post detail/edit surfaces, portal approvals surface, and other obsolete entries.

# Governing Alignment Rule

This catalog is an inventory of the existing Maximal Template implementation.

When future implementation changes are intentionally accepted by the owner, update this catalog to describe those changes.

Do not change the implementation merely to make it conform to this catalog.
