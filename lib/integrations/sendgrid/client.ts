import "server-only";

import sgMail from "@sendgrid/mail";

let configured = false;
export function getSendGridClient() {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey)
    throw new Error(
      "SendGrid is not configured. Add SENDGRID_API_KEY to .env.local.",
    );
  if (!configured) {
    sgMail.setApiKey(apiKey);
    configured = true;
  }
  return sgMail;
}
