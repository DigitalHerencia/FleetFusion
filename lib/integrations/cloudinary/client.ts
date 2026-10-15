import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;
export function getCloudinaryClient() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  const cloud_name = CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = CLOUDINARY_API_KEY?.trim();
  const api_secret = CLOUDINARY_API_SECRET?.trim();
  if (!cloud_name || !api_key || !api_secret)
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.",
    );
  if (!configured) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
  }
  return cloudinary;
}
