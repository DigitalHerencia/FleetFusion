import { PrismaClient } from '@prisma/client';

// DATABASE_URL_UNPOOLED is provided in prisma.config.ts fallbacks.
const connectionString = process.env['DATABASE_URL_UNPOOLED'] ?? process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('❌ Missing DATABASE_URL for Prisma Client initialization.');
}

// PrismaClient initialization with modern options
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

// Avoid hot-reload duplication in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
