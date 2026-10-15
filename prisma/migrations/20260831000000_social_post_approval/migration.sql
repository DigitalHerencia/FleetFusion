ALTER TABLE "SocialPost"
ADD COLUMN "approvedByMembershipId" UUID,
ADD COLUMN "approvedAt" TIMESTAMPTZ(6);

ALTER TABLE "SocialPost"
ADD CONSTRAINT "SocialPost_approvedByMembershipId_fkey"
FOREIGN KEY ("approvedByMembershipId") REFERENCES "Membership"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "SocialPost_organizationId_approvedAt_idx"
ON "SocialPost"("organizationId", "approvedAt");
