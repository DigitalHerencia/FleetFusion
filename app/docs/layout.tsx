import type { ReactNode } from 'react';

import DocsSidebar from '@/docs/components/DocsSidebar';
import styles from '@/docs/styles/modules.module.css';

export const metadata = {
  title: {
    default: 'FleetFusion Docs',
    template: '%s | FleetFusion Docs',
  },
  description: 'Guides and reference for FleetFusion fleet operations.',
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.docsShell}>
      <DocsSidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
