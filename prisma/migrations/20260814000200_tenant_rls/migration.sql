
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_identity_isolation" ON "User";

CREATE POLICY "user_identity_isolation"
ON "User"
FOR ALL
USING (
  "clerkUserId" = NULLIF(
    current_setting('app.clerk_user_id', true),
    ''
  )
)
WITH CHECK (
  "clerkUserId" = NULLIF(
    current_setting('app.clerk_user_id', true),
    ''
  )
);

ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_identity_isolation"
ON "Organization";

CREATE POLICY "organization_identity_isolation"
ON "Organization"
FOR ALL
USING (
  "clerkOrganizationId" = NULLIF(
    current_setting('app.clerk_org_id', true),
    ''
  )
)
WITH CHECK (
  "clerkOrganizationId" = NULLIF(
    current_setting('app.clerk_org_id', true),
    ''
  )
);

ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationSettings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "BillingSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingSubscription" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Asset" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CrmAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmAccount" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CrmContact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmContact" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CrmDeal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmDeal" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" FORCE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectMember" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Milestone" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" FORCE ROW LEVEL SECURITY;
ALTER TABLE "TaskDependency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskDependency" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SupportMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportMessage" FORCE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeArticle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeArticle" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Audience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Audience" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Campaign" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Campaign" FORCE ROW LEVEL SECURITY;
ALTER TABLE "CampaignStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CampaignStep" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" FORCE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceLine" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SocialAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialAccount" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SocialPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialPost" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SocialVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialVariant" FORCE ROW LEVEL SECURITY;
ALTER TABLE "SocialPostMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialPostMedia" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AiGeneration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiGeneration" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AiUsageLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiUsageLedger" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocument" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocumentVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalDocumentVersion" FORCE ROW LEVEL SECURITY;
ALTER TABLE "PortalApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PortalApproval" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" FORCE ROW LEVEL SECURITY;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'Membership',
    'OrganizationSettings',
    'BillingSubscription',
    'Asset',
    'CrmAccount',
    'CrmContact',
    'CrmDeal',
    'Project',
    'ProjectMember',
    'Milestone',
    'Task',
    'TaskDependency',
    'SupportTicket',
    'SupportMessage',
    'KnowledgeArticle',
    'Audience',
    'Campaign',
    'CampaignStep',
    'Invoice',
    'InvoiceLine',
    'Expense',
    'SocialAccount',
    'SocialPost',
    'SocialVariant',
    'SocialPostMedia',
    'AiGeneration',
    'AiUsageLedger',
    'PortalDocument',
    'PortalDocumentVersion',
    'PortalApproval',
    'AuditEvent'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS tenant_isolation ON %I',
      table_name
    );

    EXECUTE format(
      $policy$
      CREATE POLICY tenant_isolation
      ON %I
      FOR ALL
      USING (
        "organizationId"::text = NULLIF(
          current_setting('app.organization_id', true),
          ''
        )
      )
      WITH CHECK (
        "organizationId"::text = NULLIF(
          current_setting('app.organization_id', true),
          ''
        )
      )
      $policy$,
      table_name
    );
  END LOOP;
END
$$;

ALTER TABLE "CrmDeal"
ADD CONSTRAINT "crm_deal_probability_range"
CHECK ("probability" >= 0 AND "probability" <= 100);

ALTER TABLE "CrmDeal"
ADD CONSTRAINT "crm_deal_value_nonnegative"
CHECK ("value" >= 0);

ALTER TABLE "TaskDependency"
ADD CONSTRAINT "task_dependency_not_self"
CHECK ("taskId" <> "dependsOnTaskId");

ALTER TABLE "Invoice"
ADD CONSTRAINT "invoice_totals_nonnegative"
CHECK (
  "subtotal" >= 0
  AND "taxTotal" >= 0
  AND "total" >= 0
);

ALTER TABLE "InvoiceLine"
ADD CONSTRAINT "invoice_line_values_valid"
CHECK (
  "quantity" > 0
  AND "unitPrice" >= 0
  AND "taxRate" >= 0
  AND "taxRate" <= 1
  AND "lineSubtotal" >= 0
  AND "lineTax" >= 0
  AND "lineTotal" >= 0
);

ALTER TABLE "Expense"
ADD CONSTRAINT "expense_amount_nonnegative"
CHECK ("amount" >= 0);

ALTER TABLE "AiGeneration"
ADD CONSTRAINT "ai_generation_usage_nonnegative"
CHECK (
  "inputTokens" >= 0
  AND "outputTokens" >= 0
  AND "cost" >= 0
);

ALTER TABLE "AiUsageLedger"
ADD CONSTRAINT "ai_usage_nonnegative"
CHECK (
  "inputTokens" >= 0
  AND "outputTokens" >= 0
  AND "cost" >= 0
);

ALTER TABLE "PortalDocument"
ADD CONSTRAINT "portal_document_version_nonnegative"
CHECK (
  "currentVersionNumber" >= 0
  AND "version" > 0
);

