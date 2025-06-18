'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import db from '@/lib/database/db';
import { Prisma } from '@prisma/client';
import { logAuditEvent } from './auditActions';
import { getRegulatoryComplianceSummary } from '../compliance/regulatoryEngine';
import { handleError } from '@/lib/errors/handleError';
import { runRegulatoryAuditSchema } from '@/schemas/regulatory';

// Validation and auth pattern per CONTRIBUTING.md#L596-L618

export async function runRegulatoryAudit(
  organizationId: string,
  quarter: string,
  year: number
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || orgId !== organizationId) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = runRegulatoryAuditSchema.parse({ organizationId, quarter, year });

    const summary = await getRegulatoryComplianceSummary(
      parsed.organizationId,
      parsed.quarter,
      parsed.year
    );

    const record = await db.regulatoryAudit.create({
      data: {
        organizationId: parsed.organizationId,
        quarter: parsed.quarter,
        year: parsed.year,
        summary: summary as unknown as Prisma.InputJsonValue,
        createdAt: new Date(),
      },
    });

    await logAuditEvent('run_regulatory_audit', 'regulatory_audit', record.id, summary);
    revalidatePath(`/${parsed.organizationId}/compliance/audits`);

    return { success: true, data: record };
  } catch (error) {
    return handleError(error, 'Run Regulatory Audit');
  }
}
