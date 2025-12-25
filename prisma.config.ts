import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const datasourceUrl =
  env('DIRECT_URL') ?? env('DATABASE_URL') ?? process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error('Set DIRECT_URL or DATABASE_URL to connect Prisma to the database.');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: datasourceUrl,
  },
});
