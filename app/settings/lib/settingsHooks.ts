'use client';

import { useState, useTransition } from 'react';

export function useSettingsAction<Input, Output>(action: (input: Input) => Promise<Output>) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [result, setResult] = useState<Output | null>(null);

  function execute(input: Input) {
    setError('');
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await action(input));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The settings update failed.');
      }
    });
  }

  return { execute, isPending, error, result };
}
