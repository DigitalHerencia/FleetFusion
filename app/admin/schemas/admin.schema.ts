import { z } from 'zod';

const requiredText = z.string().trim().min(1);
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const roleSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().nullable().optional(),
  name: requiredText.max(80),
  description: z.string().trim().max(500).nullable().optional(),
  permissions: z.array(requiredText.max(120)).max(100).default([]),
});

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: requiredText.max(160),
  slug: requiredText
    .max(80)
    .transform((value) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .pipe(z.string().min(1, 'A valid organization slug is required')),
  timezone: requiredText.max(100).default('America/Denver'),
  isActive: z.boolean().default(true),
  ownerUserId: optionalText,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const systemDocumentSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().nullable().optional(),
  title: requiredText.max(200),
  slug: requiredText.max(120).transform((value) => value.toLowerCase().replace(/\s+/g, '-')),
  content: z.record(z.string(), z.unknown()),
  category: z.string().trim().max(80).nullable().optional(),
});

export const entityIdSchema = z.object({ id: requiredText });
export const adminListSchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export type RoleInput = z.input<typeof roleSchema>;
export type OrganizationInput = z.input<typeof organizationSchema>;
export type SystemDocumentInput = z.input<typeof systemDocumentSchema>;
