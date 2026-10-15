import Link from 'next/link';

import { DispatchForm } from '../components/DispatchForm';

export default function NewLoadPage() {
  return (
    <main className="domain-page">
      <p>
        <Link href="/dispatch">← Dispatch board</Link>
      </p>
      <h1>Create a load</h1>
      <DispatchForm />
    </main>
  );
}
