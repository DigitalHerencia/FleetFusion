import "server-only";

import { getSendGridClient } from "./client";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  organizationId: string;
}) {
  const from = process.env.SENDGRID_FROM_EMAIL?.trim();
  if (!from)
    throw new Error(
      "SendGrid is not configured. Add SENDGRID_FROM_EMAIL to .env.local.",
    );
  const { organizationId, ...message } = input;
  const [response] = await getSendGridClient().send({
    ...message,
    from,
    customArgs: { organizationId },
  });
  return {
    statusCode: response.statusCode,
    messageId: response.headers["x-message-id"],
  };
}
