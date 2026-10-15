'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { docsSections } from '@/docs/lib/docsNavigation';
import styles from '@/docs/styles/modules.module.css';

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Documentation navigation">
      <Link className={styles.brand} href="/docs">
        <span className={styles.brandMark} aria-hidden="true">
          F
        </span>
        <span>
          <strong>FleetFusion</strong>
          <small>Documentation</small>
        </span>
      </Link>
      <nav className={styles.navigation}>
        <Link className={styles.homeLink} href="/docs">
          Documentation home
        </Link>
        <Link
          aria-current={pathname === '/docs/overview' ? 'page' : undefined}
          className={
            pathname === '/docs/overview'
              ? `${styles.navLink} ${styles.navLinkActive}`
              : styles.navLink
          }
          href="/docs/overview"
        >
          Product overview
        </Link>
        {docsSections.map((section) => (
          <section className={styles.navSection} key={section.id}>
            <h2>{section.title}</h2>
            <ul>
              {section.pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    aria-current={pathname === page.href ? 'page' : undefined}
                    className={
                      pathname === page.href
                        ? `${styles.navLink} ${styles.navLinkActive}`
                        : styles.navLink
                    }
                    href={page.href}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      <p className={styles.sidebarNote}>
        Guidance is organized by task. Your available actions depend on your organization role and
        plan.
      </p>
    </aside>
  );
}
