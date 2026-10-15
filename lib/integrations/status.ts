import "server-only";

import type { IntegrationStatus } from "@/types/integrationTypes";

function hasEnvironmentValues(names: string[]): boolean {
  return names.every((name) => Boolean(process.env[name]?.trim()));
}

function status(
  name: string,
  purpose: string,
  environmentVariables: string[],
): IntegrationStatus {
  const configured = hasEnvironmentValues(environmentVariables);
  return {
    name,
    purpose,
    state: configured ? "CONFIGURED" : "MISSING SECRET",
    mode: configured ? "LIVE" : "DEMO MODE",
  };
}

export function getProviderStatuses(): IntegrationStatus[] {
  return [
    status("Stripe", "Billing, checkout, and subscriptions", [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]),
    status("Vercel Blob", "Application-owned file storage", [
      "BLOB_READ_WRITE_TOKEN",
    ]),
    status("Cloudinary", "Image transformation and media delivery", [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]),
    status("SendGrid", "Transactional email and delivery events", [
      "SENDGRID_API_KEY",
      "SENDGRID_FROM_EMAIL",
      "SENDGRID_WEBHOOK_VERIFICATION_KEY",
    ]),
    status("Hugging Face", "Hosted AI inference", ["HUGGINGFACE_ACCESS_TOKEN"]),
  ];
}
