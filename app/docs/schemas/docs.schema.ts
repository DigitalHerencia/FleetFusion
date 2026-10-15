import { z } from 'zod';

export const docsSectionIdSchema = z.enum([
  'user-docs',
  'product-guides',
  'admin-guides',
  'reference',
]);

export const docsPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().startsWith('/docs'),
  contentFile: z.string().min(1),
  section: docsSectionIdSchema.optional(),
});

export const docsSectionSchema = z.object({
  id: docsSectionIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  pages: z.array(docsPageSchema),
});
