import "server-only";

import type { TransformationOptions } from "cloudinary";

import { getCloudinaryClient } from "./client";

export function buildCloudinaryUrl(
  publicId: string,
  transformation: TransformationOptions = {},
) {
  return getCloudinaryClient().url(publicId, { secure: true, transformation });
}
