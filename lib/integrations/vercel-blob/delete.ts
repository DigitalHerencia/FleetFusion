import "server-only";

import { del } from "@vercel/blob";

import { getBlobToken } from "./client";

export function deleteBlob(urlOrPathname: string | string[]) {
  return del(urlOrPathname, { token: getBlobToken() });
}
