'use client';

import Image from 'next/image';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error: _error, reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="flex flex-col items-center space-y-6">
        <Image
          src="/white_logo.png"
          alt="Logo"
          height={64}
          width={128}
          className="mb-2 h-16 w-auto"
          priority
        />
        <span className="text-lg font-medium text-zinc-100">Oops! Something went wrong.</span>{' '}
        <span className="max-w-md text-center text-base text-zinc-400">
          We couldn't load this tenant page. Please try refreshing, or contact support if the
          problem persists.
        </span>
        <button
          onClick={() => reset()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white shadow-md transition-all duration-200 hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
