import { config } from "dotenv";

import { PrismaNeon } from "@prisma/adapter-neon";

import { Prisma, PrismaClient } from "../generated/prisma/client";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required to seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString,
  }),
});

const ids = {
  ownerUser: "00000000-0000-4000-8000-000000000001",
  agentUser: "00000000-0000-4000-8000-000000000002",

  organization: "00000000-0000-4000-8000-000000000010",
  ownerMembership: "00000000-0000-4000-8000-000000000011",
  agentMembership: "00000000-0000-4000-8000-000000000012",
  settings: "00000000-0000-4000-8000-000000000013",

  asset: "00000000-0000-4000-8000-000000000020",

  crmAccount: "00000000-0000-4000-8000-000000000030",
  crmContact: "00000000-0000-4000-8000-000000000031",
  crmDeal: "00000000-0000-4000-8000-000000000032",

  project: "00000000-0000-4000-8000-000000000040",
  projectMember: "00000000-0000-4000-8000-000000000041",
  milestone: "00000000-0000-4000-8000-000000000042",
  taskOne: "00000000-0000-4000-8000-000000000043",
  taskTwo: "00000000-0000-4000-8000-000000000044",
  taskDependency: "00000000-0000-4000-8000-000000000045",

  supportTicket: "00000000-0000-4000-8000-000000000050",
  supportMessage: "00000000-0000-4000-8000-000000000051",
  knowledgeArticle: "00000000-0000-4000-8000-000000000052",

  audience: "00000000-0000-4000-8000-000000000060",
  campaign: "00000000-0000-4000-8000-000000000061",
  campaignStep: "00000000-0000-4000-8000-000000000062",

  invoice: "00000000-0000-4000-8000-000000000070",
  invoiceLine: "00000000-0000-4000-8000-000000000071",
  expense: "00000000-0000-4000-8000-000000000072",

  socialAccount: "00000000-0000-4000-8000-000000000080",
  socialPost: "00000000-0000-4000-8000-000000000081",
  socialVariant: "00000000-0000-4000-8000-000000000082",
  socialMedia: "00000000-0000-4000-8000-000000000083",

  aiGeneration: "00000000-0000-4000-8000-000000000090",
  aiUsage: "00000000-0000-4000-8000-000000000091",

  portalDocument: "00000000-0000-4000-8000-000000000100",
  portalVersion: "00000000-0000-4000-8000-000000000101",
  portalApproval: "00000000-0000-4000-8000-000000000102",

  auditEvent: "00000000-0000-4000-8000-000000000110",
} as const;

const clerk = {
  ownerUser: "user_seed_owner",
  agentUser: "user_seed_agent",
} as const;

async function setConfig(
  tx: Prisma.TransactionClient,
  key: string,
  value: string,
): Promise<void> {
  await tx.$queryRaw`
    SELECT set_config(${key}, ${value}, true)
  `;
}

async function main(): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      await setConfig(tx, "app.clerk_user_id", clerk.ownerUser);

      const owner = await tx.user.upsert({
        where: {
          id: ids.ownerUser,
        },
        update: {
          clerkUserId: clerk.ownerUser,
          email: "owner@example.test",
          displayName: "Maximal Owner",
        },
        create: {
          id: ids.ownerUser,
          clerkUserId: clerk.ownerUser,
          email: "owner@example.test",
          displayName: "Maximal Owner",
        },
      });

      await setConfig(tx, "app.clerk_user_id", clerk.agentUser);

      const agent = await tx.user.upsert({
        where: {
          id: ids.agentUser,
        },
        update: {
          clerkUserId: clerk.agentUser,
          email: "agent@example.test",
          displayName: "Maximal Agent",
        },
        create: {
          id: ids.agentUser,
          clerkUserId: clerk.agentUser,
          email: "agent@example.test",
          displayName: "Maximal Agent",
        },
      });

      await setConfig(tx, "app.clerk_user_id", clerk.ownerUser);

      const organization = await tx.organization.upsert({
        where: {
          id: ids.organization,
        },
        update: {
          slug: "maximal-template",
          name: "The Maximal Template",
        },
        create: {
          id: ids.organization,
          slug: "maximal-template",
          name: "The Maximal Template",
        },
      });

      await setConfig(tx, "app.organization_id", organization.id);

      const ownerMembership = await tx.membership.upsert({
        where: {
          id: ids.ownerMembership,
        },
        update: {
          organizationId: organization.id,
          userId: owner.id,
          role: "OWNER",
          status: "ACTIVE",
        },
        create: {
          id: ids.ownerMembership,
          organizationId: organization.id,
          userId: owner.id,
          role: "OWNER",
          status: "ACTIVE",
        },
      });

      const agentMembership = await tx.membership.upsert({
        where: {
          id: ids.agentMembership,
        },
        update: {
          organizationId: organization.id,
          userId: agent.id,
          role: "SUPPORT",
          status: "ACTIVE",
        },
        create: {
          id: ids.agentMembership,
          organizationId: organization.id,
          userId: agent.id,
          role: "SUPPORT",
          status: "ACTIVE",
        },
      });

      await tx.organizationSettings.upsert({
        where: {
          id: ids.settings,
        },
        update: {
          organizationId: organization.id,
          timezone: "America/Phoenix",
          locale: "en-US",
          defaultCurrency: "USD",
        },
        create: {
          id: ids.settings,
          organizationId: organization.id,
          timezone: "America/Phoenix",
          locale: "en-US",
          defaultCurrency: "USD",
        },
      });

      const asset = await tx.asset.upsert({
        where: {
          id: ids.asset,
        },
        update: {
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          storageProvider: "seed",
          storageKey: "documents/maximal-template.pdf",
          filename: "maximal-template.pdf",
          contentType: "application/pdf",
          byteSize: BigInt(65_536),
          checksum: "seed-checksum",
        },
        create: {
          id: ids.asset,
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          storageProvider: "seed",
          storageKey: "documents/maximal-template.pdf",
          filename: "maximal-template.pdf",
          contentType: "application/pdf",
          byteSize: BigInt(65_536),
          checksum: "seed-checksum",
        },
      });

      const crmAccount = await tx.crmAccount.upsert({
        where: {
          id: ids.crmAccount,
        },
        update: {
          organizationId: organization.id,
          ownerMembershipId: ownerMembership.id,
          name: "Acme Client",
          website: "https://example.test",
          industry: "Software",
          status: "ACTIVE",
        },
        create: {
          id: ids.crmAccount,
          organizationId: organization.id,
          ownerMembershipId: ownerMembership.id,
          name: "Acme Client",
          website: "https://example.test",
          industry: "Software",
          status: "ACTIVE",
        },
      });

      const crmContact = await tx.crmContact.upsert({
        where: {
          id: ids.crmContact,
        },
        update: {
          organizationId: organization.id,
          accountId: crmAccount.id,
          ownerMembershipId: ownerMembership.id,
          firstName: "Alex",
          lastName: "Customer",
          email: "alex@example.test",
          title: "Operations Director",
          status: "ACTIVE",
        },
        create: {
          id: ids.crmContact,
          organizationId: organization.id,
          accountId: crmAccount.id,
          ownerMembershipId: ownerMembership.id,
          firstName: "Alex",
          lastName: "Customer",
          email: "alex@example.test",
          title: "Operations Director",
          status: "ACTIVE",
        },
      });

      await tx.crmDeal.upsert({
        where: {
          id: ids.crmDeal,
        },
        update: {
          organizationId: organization.id,
          accountId: crmAccount.id,
          primaryContactId: crmContact.id,
          ownerMembershipId: ownerMembership.id,
          name: "Maximal Template Pilot",
          stage: "PROPOSAL",
          value: new Prisma.Decimal("25000.00"),
          currency: "USD",
          probability: 65,
          expectedCloseDate: new Date("2026-09-30T00:00:00.000Z"),
        },
        create: {
          id: ids.crmDeal,
          organizationId: organization.id,
          accountId: crmAccount.id,
          primaryContactId: crmContact.id,
          ownerMembershipId: ownerMembership.id,
          name: "Maximal Template Pilot",
          stage: "PROPOSAL",
          value: new Prisma.Decimal("25000.00"),
          currency: "USD",
          probability: 65,
          expectedCloseDate: new Date("2026-09-30T00:00:00.000Z"),
        },
      });

      const project = await tx.project.upsert({
        where: {
          id: ids.project,
        },
        update: {
          organizationId: organization.id,
          ownerMembershipId: ownerMembership.id,
          name: "Launch Maximal Template",
          description: "Reference project exercising the project recipe.",
          status: "ACTIVE",
          startsAt: new Date("2026-08-01T00:00:00.000Z"),
          dueAt: new Date("2026-09-15T00:00:00.000Z"),
        },
        create: {
          id: ids.project,
          organizationId: organization.id,
          ownerMembershipId: ownerMembership.id,
          name: "Launch Maximal Template",
          description: "Reference project exercising the project recipe.",
          status: "ACTIVE",
          startsAt: new Date("2026-08-01T00:00:00.000Z"),
          dueAt: new Date("2026-09-15T00:00:00.000Z"),
        },
      });

      await tx.projectMember.upsert({
        where: {
          id: ids.projectMember,
        },
        update: {
          organizationId: organization.id,
          projectId: project.id,
          membershipId: ownerMembership.id,
          role: "OWNER",
        },
        create: {
          id: ids.projectMember,
          organizationId: organization.id,
          projectId: project.id,
          membershipId: ownerMembership.id,
          role: "OWNER",
        },
      });

      const milestone = await tx.milestone.upsert({
        where: {
          id: ids.milestone,
        },
        update: {
          organizationId: organization.id,
          projectId: project.id,
          name: "Data layer ready",
          dueAt: new Date("2026-08-21T00:00:00.000Z"),
        },
        create: {
          id: ids.milestone,
          organizationId: organization.id,
          projectId: project.id,
          name: "Data layer ready",
          dueAt: new Date("2026-08-21T00:00:00.000Z"),
        },
      });

      const taskOne = await tx.task.upsert({
        where: {
          id: ids.taskOne,
        },
        update: {
          organizationId: organization.id,
          projectId: project.id,
          milestoneId: milestone.id,
          assigneeMembershipId: ownerMembership.id,
          title: "Finalize Prisma schema",
          status: "IN_PROGRESS",
          priority: "HIGH",
          position: 1,
        },
        create: {
          id: ids.taskOne,
          organizationId: organization.id,
          projectId: project.id,
          milestoneId: milestone.id,
          assigneeMembershipId: ownerMembership.id,
          title: "Finalize Prisma schema",
          status: "IN_PROGRESS",
          priority: "HIGH",
          position: 1,
        },
      });

      const taskTwo = await tx.task.upsert({
        where: {
          id: ids.taskTwo,
        },
        update: {
          organizationId: organization.id,
          projectId: project.id,
          milestoneId: milestone.id,
          assigneeMembershipId: ownerMembership.id,
          title: "Wire feature fetchers",
          status: "TODO",
          priority: "HIGH",
          position: 2,
        },
        create: {
          id: ids.taskTwo,
          organizationId: organization.id,
          projectId: project.id,
          milestoneId: milestone.id,
          assigneeMembershipId: ownerMembership.id,
          title: "Wire feature fetchers",
          status: "TODO",
          priority: "HIGH",
          position: 2,
        },
      });

      await tx.taskDependency.upsert({
        where: {
          id: ids.taskDependency,
        },
        update: {
          organizationId: organization.id,
          taskId: taskTwo.id,
          dependsOnTaskId: taskOne.id,
        },
        create: {
          id: ids.taskDependency,
          organizationId: organization.id,
          taskId: taskTwo.id,
          dependsOnTaskId: taskOne.id,
        },
      });

      const ticket = await tx.supportTicket.upsert({
        where: {
          id: ids.supportTicket,
        },
        update: {
          organizationId: organization.id,
          requesterUserId: owner.id,
          assignedMembershipId: agentMembership.id,
          number: 1,
          subject: "Example support request",
          description:
            "Seed ticket exercising support ownership and assignment.",
          status: "IN_PROGRESS",
          priority: "NORMAL",
        },
        create: {
          id: ids.supportTicket,
          organizationId: organization.id,
          requesterUserId: owner.id,
          assignedMembershipId: agentMembership.id,
          number: 1,
          subject: "Example support request",
          description:
            "Seed ticket exercising support ownership and assignment.",
          status: "IN_PROGRESS",
          priority: "NORMAL",
        },
      });

      await tx.supportMessage.upsert({
        where: {
          id: ids.supportMessage,
        },
        update: {
          organizationId: organization.id,
          ticketId: ticket.id,
          authorMembershipId: agentMembership.id,
          authorLabel: "Maximal Agent",
          body: "We are looking into this.",
          isInternal: false,
        },
        create: {
          id: ids.supportMessage,
          organizationId: organization.id,
          ticketId: ticket.id,
          authorMembershipId: agentMembership.id,
          authorLabel: "Maximal Agent",
          body: "We are looking into this.",
          isInternal: false,
        },
      });

      await tx.knowledgeArticle.upsert({
        where: {
          id: ids.knowledgeArticle,
        },
        update: {
          organizationId: organization.id,
          authorMembershipId: agentMembership.id,
          slug: "getting-started",
          title: "Getting Started",
          body: "Welcome to the maximal template.",
          status: "PUBLISHED",
          publishedAt: new Date("2026-08-01T12:00:00.000Z"),
        },
        create: {
          id: ids.knowledgeArticle,
          organizationId: organization.id,
          authorMembershipId: agentMembership.id,
          slug: "getting-started",
          title: "Getting Started",
          body: "Welcome to the maximal template.",
          status: "PUBLISHED",
          publishedAt: new Date("2026-08-01T12:00:00.000Z"),
        },
      });

      const audience = await tx.audience.upsert({
        where: {
          id: ids.audience,
        },
        update: {
          organizationId: organization.id,
          name: "Active Customers",
          definition: {
            operator: "and",
            rules: [
              {
                field: "status",
                operator: "equals",
                value: "active",
              },
            ],
          },
          status: "ACTIVE",
        },
        create: {
          id: ids.audience,
          organizationId: organization.id,
          name: "Active Customers",
          definition: {
            operator: "and",
            rules: [
              {
                field: "status",
                operator: "equals",
                value: "active",
              },
            ],
          },
          status: "ACTIVE",
        },
      });

      const campaign = await tx.campaign.upsert({
        where: {
          id: ids.campaign,
        },
        update: {
          organizationId: organization.id,
          audienceId: audience.id,
          ownerMembershipId: ownerMembership.id,
          name: "Maximal Launch",
          description: "Seed marketing campaign.",
          status: "DRAFT",
        },
        create: {
          id: ids.campaign,
          organizationId: organization.id,
          audienceId: audience.id,
          ownerMembershipId: ownerMembership.id,
          name: "Maximal Launch",
          description: "Seed marketing campaign.",
          status: "DRAFT",
        },
      });

      await tx.campaignStep.upsert({
        where: {
          id: ids.campaignStep,
        },
        update: {
          organizationId: organization.id,
          campaignId: campaign.id,
          position: 1,
          type: "EMAIL",
          config: {
            templateKey: "maximal-launch",
          },
        },
        create: {
          id: ids.campaignStep,
          organizationId: organization.id,
          campaignId: campaign.id,
          position: 1,
          type: "EMAIL",
          config: {
            templateKey: "maximal-launch",
          },
        },
      });

      const lineSubtotal = new Prisma.Decimal("1000.00");
      const lineTax = new Prisma.Decimal("82.50");
      const lineTotal = lineSubtotal.add(lineTax);

      const invoice = await tx.invoice.upsert({
        where: {
          id: ids.invoice,
        },
        update: {
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          number: 1,
          customerName: "Acme Client",
          customerEmail: "billing@example.test",
          currency: "USD",
          subtotal: lineSubtotal,
          taxTotal: lineTax,
          total: lineTotal,
          status: "OPEN",
          issuedAt: new Date("2026-08-01T00:00:00.000Z"),
          dueAt: new Date("2026-08-31T00:00:00.000Z"),
        },
        create: {
          id: ids.invoice,
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          number: 1,
          customerName: "Acme Client",
          customerEmail: "billing@example.test",
          currency: "USD",
          subtotal: lineSubtotal,
          taxTotal: lineTax,
          total: lineTotal,
          status: "OPEN",
          issuedAt: new Date("2026-08-01T00:00:00.000Z"),
          dueAt: new Date("2026-08-31T00:00:00.000Z"),
        },
      });

      await tx.invoiceLine.upsert({
        where: {
          id: ids.invoiceLine,
        },
        update: {
          organizationId: organization.id,
          invoiceId: invoice.id,
          position: 1,
          description: "Maximal Template Implementation",
          quantity: new Prisma.Decimal("1"),
          unitPrice: new Prisma.Decimal("1000.00"),
          taxRate: new Prisma.Decimal("0.0825"),
          lineSubtotal,
          lineTax,
          lineTotal,
        },
        create: {
          id: ids.invoiceLine,
          organizationId: organization.id,
          invoiceId: invoice.id,
          position: 1,
          description: "Maximal Template Implementation",
          quantity: new Prisma.Decimal("1"),
          unitPrice: new Prisma.Decimal("1000.00"),
          taxRate: new Prisma.Decimal("0.0825"),
          lineSubtotal,
          lineTax,
          lineTotal,
        },
      });

      await tx.expense.upsert({
        where: {
          id: ids.expense,
        },
        update: {
          organizationId: organization.id,
          submittedByMembershipId: ownerMembership.id,
          receiptAssetId: asset.id,
          vendor: "Example Vendor",
          description: "Seed project expense",
          amount: new Prisma.Decimal("125.00"),
          currency: "USD",
          incurredAt: new Date("2026-08-05T00:00:00.000Z"),
          status: "APPROVED",
        },
        create: {
          id: ids.expense,
          organizationId: organization.id,
          submittedByMembershipId: ownerMembership.id,
          receiptAssetId: asset.id,
          vendor: "Example Vendor",
          description: "Seed project expense",
          amount: new Prisma.Decimal("125.00"),
          currency: "USD",
          incurredAt: new Date("2026-08-05T00:00:00.000Z"),
          status: "APPROVED",
        },
      });

      const socialAccount = await tx.socialAccount.upsert({
        where: {
          id: ids.socialAccount,
        },
        update: {
          organizationId: organization.id,
          provider: "LINKEDIN",
          providerAccountId: "seed-linkedin-account",
          displayName: "Maximal Template",
          credentialRef: null,
          active: true,
        },
        create: {
          id: ids.socialAccount,
          organizationId: organization.id,
          provider: "LINKEDIN",
          providerAccountId: "seed-linkedin-account",
          displayName: "Maximal Template",
          credentialRef: null,
          active: true,
        },
      });

      const socialPost = await tx.socialPost.upsert({
        where: {
          id: ids.socialPost,
        },
        update: {
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          title: "Launch",
          content: "The Maximal Template is coming.",
          status: "SCHEDULED",
          scheduledAt: new Date("2026-09-01T18:00:00.000Z"),
        },
        create: {
          id: ids.socialPost,
          organizationId: organization.id,
          createdByMembershipId: ownerMembership.id,
          title: "Launch",
          content: "The Maximal Template is coming.",
          status: "SCHEDULED",
          scheduledAt: new Date("2026-09-01T18:00:00.000Z"),
        },
      });

      await tx.socialVariant.upsert({
        where: {
          id: ids.socialVariant,
        },
        update: {
          organizationId: organization.id,
          postId: socialPost.id,
          socialAccountId: socialAccount.id,
          content: "The Maximal Template is coming.",
          status: "SCHEDULED",
        },
        create: {
          id: ids.socialVariant,
          organizationId: organization.id,
          postId: socialPost.id,
          socialAccountId: socialAccount.id,
          content: "The Maximal Template is coming.",
          status: "SCHEDULED",
        },
      });

      await tx.socialPostMedia.upsert({
        where: {
          id: ids.socialMedia,
        },
        update: {
          organizationId: organization.id,
          postId: socialPost.id,
          assetId: asset.id,
          position: 1,
        },
        create: {
          id: ids.socialMedia,
          organizationId: organization.id,
          postId: socialPost.id,
          assetId: asset.id,
          position: 1,
        },
      });

      const generation = await tx.aiGeneration.upsert({
        where: {
          id: ids.aiGeneration,
        },
        update: {
          organizationId: organization.id,
          userId: owner.id,
          provider: "seed",
          model: "maximal-model",
          status: "SUCCEEDED",
          input: {
            prompt: "Summarize the maximal template.",
          },
          output: {
            text: "One superset, many recipes.",
          },
          requestHash: "seed-generation",
          inputTokens: 10,
          outputTokens: 6,
          cost: new Prisma.Decimal("0.00010000"),
          startedAt: new Date("2026-08-10T12:00:00.000Z"),
          completedAt: new Date("2026-08-10T12:00:01.000Z"),
        },
        create: {
          id: ids.aiGeneration,
          organizationId: organization.id,
          userId: owner.id,
          provider: "seed",
          model: "maximal-model",
          status: "SUCCEEDED",
          input: {
            prompt: "Summarize the maximal template.",
          },
          output: {
            text: "One superset, many recipes.",
          },
          requestHash: "seed-generation",
          inputTokens: 10,
          outputTokens: 6,
          cost: new Prisma.Decimal("0.00010000"),
          startedAt: new Date("2026-08-10T12:00:00.000Z"),
          completedAt: new Date("2026-08-10T12:00:01.000Z"),
        },
      });

      await tx.aiUsageLedger.upsert({
        where: {
          id: ids.aiUsage,
        },
        update: {
          organizationId: organization.id,
          userId: owner.id,
          generationId: generation.id,
          provider: generation.provider,
          model: generation.model,
          inputTokens: 10,
          outputTokens: 6,
          cost: new Prisma.Decimal("0.00010000"),
        },
        create: {
          id: ids.aiUsage,
          organizationId: organization.id,
          userId: owner.id,
          generationId: generation.id,
          provider: generation.provider,
          model: generation.model,
          inputTokens: 10,
          outputTokens: 6,
          cost: new Prisma.Decimal("0.00010000"),
        },
      });

      const document = await tx.portalDocument.upsert({
        where: {
          id: ids.portalDocument,
        },
        update: {
          organizationId: organization.id,
          title: "Implementation Plan",
          description: "Seed portal document.",
          status: "IN_REVIEW",
          clientVisible: true,
          currentVersionNumber: 1,
        },
        create: {
          id: ids.portalDocument,
          organizationId: organization.id,
          title: "Implementation Plan",
          description: "Seed portal document.",
          status: "IN_REVIEW",
          clientVisible: true,
          currentVersionNumber: 1,
        },
      });

      const documentVersion = await tx.portalDocumentVersion.upsert({
        where: {
          id: ids.portalVersion,
        },
        update: {
          organizationId: organization.id,
          documentId: document.id,
          assetId: asset.id,
          uploadedByMembershipId: ownerMembership.id,
          versionNumber: 1,
          notes: "Initial version",
        },
        create: {
          id: ids.portalVersion,
          organizationId: organization.id,
          documentId: document.id,
          assetId: asset.id,
          uploadedByMembershipId: ownerMembership.id,
          versionNumber: 1,
          notes: "Initial version",
        },
      });

      await tx.portalApproval.upsert({
        where: {
          id: ids.portalApproval,
        },
        update: {
          organizationId: organization.id,
          documentVersionId: documentVersion.id,
          reviewerMembershipId: ownerMembership.id,
          reviewerLabel: "Maximal Owner",
          status: "PENDING",
        },
        create: {
          id: ids.portalApproval,
          organizationId: organization.id,
          documentVersionId: documentVersion.id,
          reviewerMembershipId: ownerMembership.id,
          reviewerLabel: "Maximal Owner",
          status: "PENDING",
        },
      });

      await tx.auditEvent.upsert({
        where: {
          id: ids.auditEvent,
        },
        update: {
          organizationId: organization.id,
          actorUserId: owner.id,
          action: "seed.completed",
          resourceType: "Organization",
          resourceId: organization.id,
          metadata: {
            recipes: [
              "crm",
              "projects",
              "support",
              "marketing",
              "invoicing",
              "social",
              "ai",
              "portal",
              "admin",
            ],
          },
        },
        create: {
          id: ids.auditEvent,
          organizationId: organization.id,
          actorUserId: owner.id,
          action: "seed.completed",
          resourceType: "Organization",
          resourceId: organization.id,
          metadata: {
            recipes: [
              "crm",
              "projects",
              "support",
              "marketing",
              "invoicing",
              "social",
              "ai",
              "portal",
              "admin",
            ],
          },
        },
      });
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
