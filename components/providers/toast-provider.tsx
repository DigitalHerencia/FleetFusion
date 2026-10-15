'use client';

import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster closeButton position="top-right" richColors />
    </>
  );
}

export default ToastProvider;
