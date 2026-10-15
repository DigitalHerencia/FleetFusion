import type {
  CrmContactStatus,
  CrmDealStage as PrismaCrmDealStage,
} from "@/generated/prisma/enums";
import type { contactSortValues } from "@/schemas/crmSchemas";

export type ContactStatus = CrmContactStatus;
export type EditableContactStatus = Exclude<ContactStatus, "ARCHIVED">;

export type ContactSort = (typeof contactSortValues)[number];

export interface ContactListCriteria {
  query: string;
  status?: EditableContactStatus;
  sort: ContactSort;
  limit: number;
}

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  status: EditableContactStatus;
}

export interface CrmContactDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: ContactStatus;
  account: { id: string; name: string } | null;
  owner: { membershipId: string; displayName: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDealSummaryDTO {
  id: string;
  name: string;
  stage: string;
  value: string;
  currency: string;
  probability: number;
  expectedCloseDate: string | null;
  version: number;
  account: { id: string; name: string };
  owner: { id: string; displayName: string | null } | null;
}

export interface CrmDealDTO extends CrmDealSummaryDTO {
  primaryContact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmAccountDTO {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  status: string;
  notes: string | null;
  contactCount: number;
  dealCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CrmDealStage = PrismaCrmDealStage;

export interface CloseDealCommand {
  dealId: string;
  outcome: Extract<CrmDealStage, "WON" | "LOST">;
  expectedVersion: number;
}

export interface ReopenOpportunityCommand {
  dealId: string;
  expectedVersion: number;
}
