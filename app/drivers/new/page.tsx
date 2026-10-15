import Link from 'next/link';

import { DriverForm } from '../components/DriverForm';

export default function NewDriverPage() {
  return (
    <main className="domain-page">
      <p>
        <Link href="/drivers">← Drivers</Link>
      </p>
      <h1>Add driver</h1>
      <DriverForm />
    </main>
  );
}
