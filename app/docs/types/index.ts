import type { Route } from 'next';

export type DocsSectionId = 'user-docs' | 'product-guides' | 'admin-guides' | 'reference';

export interface DocsPage {
  slug: string;
  title: string;
  description: string;
  href: Route;
  contentFile: string;
  section?: DocsSectionId | undefined;
}

export interface DocsSection {
  id: DocsSectionId;
  title: string;
  description: string;
  pages: DocsPage[];
}
