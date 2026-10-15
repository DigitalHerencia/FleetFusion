'use client';

export default function DocsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm font-semibold tracking-wide text-sky-300 uppercase">Documentation</p>
      <h1 className="text-2xl font-semibold text-white">This page could not be loaded</h1>
      <p className="text-sm leading-6 text-zinc-300">
        The guide may be temporarily unavailable. Try again, or return to the documentation index.
      </p>
      <div className="flex gap-3">
        <button
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <a
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100"
          href="/docs"
        >
          Docs home
        </a>
      </div>
    </section>
  );
}
