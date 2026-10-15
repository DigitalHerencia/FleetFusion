import "server-only";

import { createHash } from "node:crypto";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "dotenv";

import { PrismaClient } from "@/generated/prisma/client";

const localEnvironment: Record<string, string> = {};
config({ path: ".env.local", quiet: true, processEnv: localEnvironment });
config({ path: ".env.local", quiet: true });
config({ quiet: true });

// Local development targets the checked-out app, not an unrelated inherited URL.
const connectionString =
  process.env.NODE_ENV === "development"
    ? (localEnvironment.DATABASE_URL ?? process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const adapter = new PrismaNeon({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionFingerprint?: string;
};

const connectionFingerprint = createHash("sha256")
  .update(connectionString)
  .digest("hex");
const cachedClient =
  globalForPrisma.prismaConnectionFingerprint === connectionFingerprint
    ? globalForPrisma.prisma
    : undefined;
if (globalForPrisma.prisma && !cachedClient) {
  void globalForPrisma.prisma.$disconnect();
}

export const prisma =
  cachedClient ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionFingerprint = connectionFingerprint;
}
