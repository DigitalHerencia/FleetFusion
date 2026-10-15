import Link from 'next/link';

export function DriverMobileHeader({ name }: { name: string }) {
  return (
    <header className="driver-mobile-header">
      <p>Driver workspace</p>
      <strong>{name}</strong>
      <nav>
        <Link href="/drivers">All drivers</Link>
        <Link href="/dispatch">Loads</Link>
      </nav>
    </header>
  );
}

export default DriverMobileHeader;
