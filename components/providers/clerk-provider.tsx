import { ClerkProvider as ClerkJsProvider } from '@clerk/nextjs';
import type { ComponentProps, ReactNode } from 'react';

type ClerkAppProviderProps = Omit<ComponentProps<typeof ClerkJsProvider>, 'children'> & {
  children: ReactNode;
};

export function ClerkProvider({ children, ...props }: ClerkAppProviderProps) {
  return (
    <ClerkJsProvider signInUrl="/sign-in" signUpUrl="/sign-up" {...props}>
      {children}
    </ClerkJsProvider>
  );
}

export default ClerkProvider;
