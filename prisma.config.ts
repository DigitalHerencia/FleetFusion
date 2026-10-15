import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const datasourceUrl = process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'];

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Client generation and Next.js type generation do not need a live database.
  // Keep the URL optional so CI/Vercel builds can run without production DB secrets;
  // Prisma migrate commands will still require a configured database URL.
  ...(datasourceUrl ? { datasource: { url: datasourceUrl } } : {}),
});
