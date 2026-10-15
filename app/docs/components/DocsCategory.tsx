import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDocsSection } from '@/docs/lib/docsNavigation';
import styles from '@/docs/styles/modules.module.css';

import DocsBreadcrumbs from './DocsBreadcrumbs';

export default function DocsCategory({ sectionId }: { sectionId: string }) {
  const section = getDocsSection(
    sectionId as 'user-docs' | 'product-guides' | 'admin-guides' | 'reference',
  );
  if (!section) notFound();

  return (
    <div className={styles.categoryPage}>
      <DocsBreadcrumbs />
      <header className={styles.categoryHeader}>
        <p className={styles.eyebrow}>Documentation section</p>
        <h1>{section.title}</h1>
        <p>{section.description}</p>
      </header>
      <div className={styles.cardGrid}>
        {section.pages.map((page) => (
          <Link className={styles.docCard} href={page.href} key={page.slug}>
            <span className={styles.cardEyebrow}>{section.title}</span>
            <h2>{page.title}</h2>
            <p>{page.description}</p>
            <span className={styles.cardLink}>
              Read guide <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
      <Link className={styles.backLink} href="/docs">
        ← Documentation home
      </Link>
    </div>
  );
}
