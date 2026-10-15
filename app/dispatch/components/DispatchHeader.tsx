import Link from 'next/link';

export function DispatchHeader({ activeLoads = 0 }: { activeLoads?: number }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">Operations</p>
        <h1>Dispatch</h1>
        <p>Manage assignments and keep every load moving.</p>
      </div>
      <div className="page-header__actions">
        <span>{activeLoads} active loads</span>
        <Link href="/dispatch/new">Create load</Link>
      </div>
    </header>
  );
}

export default DispatchHeader;
