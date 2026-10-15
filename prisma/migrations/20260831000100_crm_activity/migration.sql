CREATE TABLE "CrmActivity" (
  "id" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "authoredByMembershipId" UUID,
  "recordType" TEXT NOT NULL,
  "recordId" UUID NOT NULL,
  "kind" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT,
  "occurredAt" TIMESTAMPTZ(6) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CrmActivity"
ADD CONSTRAINT "CrmActivity_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmActivity"
ADD CONSTRAINT "CrmActivity_authoredByMembershipId_fkey"
FOREIGN KEY ("authoredByMembershipId") REFERENCES "Membership"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CrmActivity_organizationId_recordType_recordId_occurredAt_idx"
ON "CrmActivity"("organizationId", "recordType", "recordId", "occurredAt");

CREATE INDEX "CrmActivity_organizationId_authoredByMembershipId_idx"
ON "CrmActivity"("organizationId", "authoredByMembershipId");

ALTER TABLE "CrmActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmActivity" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "CrmActivity"
FOR ALL
USING (
  "organizationId" = NULLIF(current_setting('app.organization_id', true), '')::uuid
)
WITH CHECK (
  "organizationId" = NULLIF(current_setting('app.organization_id', true), '')::uuid
);
