import { z } from "zod";

export const sendGridWebhookEventsSchema = z.array(
  z
    .object({
      event: z.string(),
      sg_event_id: z.string(),
      sg_message_id: z.string().optional(),
      organizationId: z.string().uuid(),
    })
    .passthrough(),
);
