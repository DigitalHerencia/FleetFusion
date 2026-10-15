import { readFileSync } from 'node:fs';
import path from 'node:path';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getDocsPage } from '@/docs/lib/docsNavigation';
import styles from '@/docs/styles/modules.module.css';
import { parseMarkdown } from '@/docs/utils/mdx-components';

import DocsBreadcrumbs from './DocsBreadcrumbs';

function loadMarkdown(contentFile: string): string {
  const contentRoot = path.join(process.cwd(), 'app', 'docs', 'content');
  return readFileSync(path.join(contentRoot, contentFile), 'utf8');
}

export default function DocsContent({ slug }: { slug: string }) {
  const page = getDocsPage(slug);
  const isHome = slug === 'index';

  if (!page && !isHome) notFound();

  let markdown: string;
  try {
    markdown = loadMarkdown(isHome ? 'index.md' : page!.contentFile);
  } catch {
    notFound();
  }

  const { blocks, headings } = parseMarkdown(markdown);
  const contentIndex = headings.filter((heading) => heading.level > 1);

  return (
    <div className={styles.documentLayout}>
      <article className={styles.article}>
        <DocsBreadcrumbs page={page} />
        <div className={styles.lead}>
          {page && <p>{page.description}</p>}
          {isHome && (
            <p>Practical guides and references for running your fleet with FleetFusion.</p>
          )}
        </div>
        <div className={styles.prose}>{blocks}</div>
        {page?.section && (
          <footer className={styles.articleFooter}>
            <span>Need another guide?</span>
            <Link href={`/docs/${page.section}`}>Browse {page.section.replace('-', ' ')}</Link>
          </footer>
        )}
      </article>
      {contentIndex.length > 0 && (
        <aside className={styles.contents}>
          <h2>On this page</h2>
          <nav aria-label="On this page">
            <ul>
              {contentIndex.map((heading) => (
                <li
                  className={heading.level === 3 ? styles.contentsSubitem : undefined}
                  key={heading.id}
                >
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
