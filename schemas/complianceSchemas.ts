import { z } from "zod";
import {
  ComplianceItemType,
  ComplianceSubjectType,
} from "@/generated/prisma/enums";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const dateField = z.coerce.date().nullable().optional();

export const complianceItemInputSchema = z.object({
  subjectType: z.enum(ComplianceSubjectType),
  driverId: z.uuid().nullable().optional(),
  vehicleId: z.uuid().nullable().optional(),
  type: z.enum(ComplianceItemType),
  title: optionalText(200),
  referenceNumber: optionalText(100),
  issuedAt: dateField,
  expiresAt: dateField,
  assetId: z.uuid().nullable().optional(),
}).superRefine((item, context) => {
  if (item.subjectType === "ORGANIZATION" && (item.driverId || item.vehicleId)) {
    context.addIssue({ code: "custom", message: "Organization documents cannot be assigned to a driver or vehicle.", path: ["subjectType"] });
  }
  if (item.subjectType === "DRIVER" && (!item.driverId || item.vehicleId)) {
    context.addIssue({ code: "custom", message: "Choose exactly one driver for a driver document.", path: ["driverId"] });
  }
  if (item.subjectType === "VEHICLE" && (!item.vehicleId || item.driverId)) {
    context.addIssue({ code: "custom", message: "Choose exactly one vehicle for a vehicle document.", path: ["vehicleId"] });
  }
  if (item.issuedAt && item.expiresAt && item.expiresAt < item.issuedAt) {
    context.addIssue({ code: "custom", message: "Expiry date cannot precede the issue date.", path: ["expiresAt"] });
  }
});

export const updateComplianceItemSchema = complianceItemInputSchema.extend({
  complianceItemId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});

export const archiveComplianceItemSchema = z.object({
  complianceItemId: z.uuid(),
  expectedVersion: z.number().int().positive(),
});
