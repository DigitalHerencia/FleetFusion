import type { Prisma } from "@/generated/prisma/client";

export const crmDealSummarySelect = {
  id: true,
  name: true,
  stage: true,
  value: true,
  currency: true,
  probability: true,
  expectedCloseDate: true,
  version: true,
  account: {
    select: {
      id: true,
      name: true,
    },
  },
  owner: {
    select: {
      id: true,
      user: {
        select: {
          displayName: true,
        },
      },
    },
  },
} satisfies Prisma.CrmDealSelect;

export const crmDealDetailSelect = {
  ...crmDealSummarySelect,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
  primaryContact: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} satisfies Prisma.CrmDealSelect;

export type CrmDealSummaryRecord = Prisma.CrmDealGetPayload<{
  select: typeof crmDealSummarySelect;
}>;

export type CrmDealDetailRecord = Prisma.CrmDealGetPayload<{
  select: typeof crmDealDetailSelect;
}>;

export const crmContactSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  title: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  account: { select: { id: true, name: true } },
  owner: {
    select: {
      id: true,
      user: { select: { displayName: true } },
    },
  },
} satisfies Prisma.CrmContactSelect;

export const crmContactAccessSelect = {
  id: true,
  organizationId: true,
  ownerMembershipId: true,
  updatedAt: true,
} satisfies Prisma.CrmContactSelect;

export const crmAccountSelect = {
  id: true,
  name: true,
  website: true,
  industry: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { contacts: true, deals: true } },
} satisfies Prisma.CrmAccountSelect;

export type CrmContactRecord = Prisma.CrmContactGetPayload<{
  select: typeof crmContactSelect;
}>;

export type CrmAccountRecord = Prisma.CrmAccountGetPayload<{
  select: typeof crmAccountSelect;
}>;
