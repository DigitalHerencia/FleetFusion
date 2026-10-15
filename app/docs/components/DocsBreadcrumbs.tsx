import Link from 'next/link';

import { getDocsSection } from '@/docs/lib/docsNavigation';
import styles from '@/docs/styles/modules.module.css';
import type { DocsPage } from '@/docs/types';

export default function DocsBreadcrumbs({ page }: { page?: DocsPage | undefined }) {
  const section = page?.section ? getDocsSection(page.section) : undefined;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <Link href="/docs">Docs</Link>
      {section && (
        <>
          <span aria-hidden="true">/</span>
          <Link href={`/docs/${section.id}`}>{section.title}</Link>
        </>
      )}
      {page && (
        <>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{page.title}</span>
        </>
      )}
    </nav>
  );
}
