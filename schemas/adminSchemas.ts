import { z } from "zod";
import { SubscriptionStatus } from "@/generated/prisma/enums";
import { appRoles } from "@/lib/authz/roles";

export const adminRoleSchema = z.enum(appRoles);

export const changeAdminMembershipSchema = z.object({
  membershipId: z.string().uuid(),
  role: adminRoleSchema,
});

export const updateAdminMembershipStatusSchema = z.object({
  membershipId: z.string().uuid(),
});

export const reconcileAdminProviderStateSchema = z.object({
  provider: z.string().trim().min(1).max(100),
  providerCustomerId: z.string().trim().min(1).max(255).nullable().optional(),
  providerSubscriptionId: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .nullable()
    .optional(),
  planKey: z.string().trim().min(1).max(100),
  status: z.enum(SubscriptionStatus),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  cancelAtPeriodEnd: z.boolean(),
});

export const addAdminMembershipSchema = z.object({
  email: z.string().trim().email(),
  role: adminRoleSchema,
});
