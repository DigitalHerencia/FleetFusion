import '@/app/globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import type React from 'react';

import { AuthProvider } from '@/components/auth/context';
import { PageLayout } from '@/components/shared/PageLayout';
import { ThemeProvider } from '@/components/shared/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FleetFusion - Enterprise-Grade Fleet Management',
  description: 'Modern transportation management system for small-to-mid-size trucking fleets',
  icons: '/map-pinned_icon.png',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`dark ${inter.variable} ${playfair.variable}`}
        suppressHydrationWarning
      >
        <body className="bg-background text-foreground min-h-screen">
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <PageLayout className="gap-0">{children}</PageLayout>
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
