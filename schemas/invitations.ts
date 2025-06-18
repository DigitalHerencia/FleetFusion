import { z } from 'zod';
import { SystemRoles } from '@/types/abac';

export const invitationSchema = z.object({
  emailAddress: z.string().email('Valid email required'),
  role: z.enum(Object.values(SystemRoles) as [string, ...string[]]),
  redirectUrl: z.string().url().optional(),
});

export type InvitationSchemaData = z.infer<typeof invitationSchema>;
