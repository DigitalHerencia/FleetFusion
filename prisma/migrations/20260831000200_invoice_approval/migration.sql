ALTER TABLE "Invoice"
ADD COLUMN "approvedByMembershipId" UUID,
ADD COLUMN "approvedAt" TIMESTAMPTZ(6);

ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_approvedByMembershipId_fkey"
FOREIGN KEY ("approvedByMembershipId") REFERENCES "Membership"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Invoice_organizationId_approvedAt_idx"
ON "Invoice"("organizationId", "approvedAt");
