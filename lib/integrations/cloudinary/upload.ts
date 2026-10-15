import "server-only";

import type { UploadApiOptions } from "cloudinary";

import { getCloudinaryClient } from "./client";

export function uploadCloudinaryAsset(
  source: string,
  options: UploadApiOptions = {},
) {
  return getCloudinaryClient().uploader.upload(source, {
    resource_type: "auto",
    ...options,
  });
}
