import "server-only";

import { put } from "@vercel/blob";

import { getBlobToken } from "./client";

export function uploadBlob(
  pathname: string,
  body: Parameters<typeof put>[1],
  contentType?: string,
) {
  return put(pathname, body, {
    access: "private",
    addRandomSuffix: true,
    ...(contentType === undefined ? {} : { contentType }),
    token: getBlobToken(),
  });
}
