import { z } from "zod";
import { ApprovalStatus } from "@/generated/prisma/enums";

export const createPortalDocumentSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().max(10_000).nullable().optional(),
  clientVisible: z.boolean().default(false),
});

export const addPortalDocumentVersionSchema = z.object({
  documentId: z.string().uuid(),
  assetId: z.string().uuid(),
  notes: z.string().max(10_000).nullable().optional(),
  expectedVersion: z.number().int().positive(),
});

export const decidePortalApprovalSchema = z.object({
  approvalId: z.string().uuid(),
  status: z.enum(ApprovalStatus).exclude(["PENDING"]),
  note: z.string().max(10_000).nullable().optional(),
});

export const portalDocumentCommandSchema = z.object({
  documentId: z.string().uuid(),
  expectedVersion: z.number().int().positive(),
});
