import React from 'react';

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12 md:px-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Contact Us</h1>
      <section className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="mb-1 text-2xl font-semibold">Sales</h2>
          <p>(915) 474-4564</p>
        </div>
        <div>
          <h2 className="mb-1 text-2xl font-semibold">Support</h2>
          <p>DigitalHerencia@gmail.com</p>
        </div>
        <div>
          <h2 className="mb-1 text-2xl font-semibold">Address</h2>
          <p>3109 Bosque Road, Anthony, NM 88021</p>
        </div>
      </section>
    </main>
  );
}
