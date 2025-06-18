import { z } from 'zod';

export const runRegulatoryAuditSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID required'),
  quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  year: z.number().min(2000),
});

export type RunRegulatoryAuditData = z.infer<typeof runRegulatoryAuditSchema>;
