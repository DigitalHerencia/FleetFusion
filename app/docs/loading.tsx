import styles from '@/docs/styles/modules.module.css';

export default function DocsLoading() {
  return (
    <div aria-label="Loading documentation" className={styles.loadingState} role="status">
      <span className={styles.loadingLine} />
      <span className={styles.loadingTitle} />
      <span className={styles.loadingLine} />
      <span className={styles.loadingLine} />
      <span className={styles.loadingLineShort} />
    </div>
  );
}
