import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

export function getClerk() {
  return clerkClient();
}
