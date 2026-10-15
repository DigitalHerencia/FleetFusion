import { z } from "zod";
import { CrmContactStatus, CrmDealStage } from "@/generated/prisma/enums";

const uuid = z.string().uuid();
const currency = z
  .string()
  .length(3)
  .transform((value) => value.toUpperCase());
const money = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, "Expected a non-negative decimal.");

export const contactStatusSchema = z
  .enum(CrmContactStatus)
  .exclude(["ARCHIVED"]);
export const contactIdSchema = uuid;
export const contactSortValues = [
  "name-asc",
  "name-desc",
  "updated-desc",
] as const;

export const contactListCriteriaSchema = z.object({
  query: z.string().trim().max(100).default(""),
  status: contactStatusSchema.optional(),
  sort: z.enum(contactSortValues).default("name-asc"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  email: z.union([z.literal(""), z.string().trim().email()]),
  phone: z.string().trim().max(50),
  title: z.string().trim().max(150),
  status: contactStatusSchema,
});

export const createContactSchema = contactFormSchema;

export const updateContactSchema = contactFormSchema.extend({
  contactId: uuid,
  expectedUpdatedAt: z.coerce.date(),
});

export const archiveContactSchema = z.object({
  contactId: uuid,
  expectedUpdatedAt: z.coerce.date(),
});

export const createCrmDealSchema = z.object({
  accountId: uuid,
  primaryContactId: uuid.nullable().optional(),
  ownerMembershipId: uuid.nullable().optional(),
  name: z.string().trim().min(1).max(200),
  value: money.default("0"),
  currency: currency.default("USD"),
  probability: z.number().int().min(0).max(100).default(0),
  expectedCloseDate: z.coerce.date().nullable().optional(),
});

export const updateCrmDealStageSchema = z.object({
  dealId: uuid,
  stage: z.enum(CrmDealStage),
  expectedVersion: z.number().int().positive(),
});

export const crmAccountFormSchema = z.object({
  name: z.string().trim().min(1).max(200),
  website: z.union([
    z.literal(""),
    z
      .string()
      .url()
      .regex(/^https?:\/\//),
  ]),
  industry: z.string().trim().max(200),
  notes: z.string().max(20000),
});
export const updateCrmAccountSchema = crmAccountFormSchema.extend({
  accountId: uuid,
  expectedUpdatedAt: z.coerce.date(),
});

export { CrmDealStage } from "@/generated/prisma/enums";
