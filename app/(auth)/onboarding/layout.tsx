'use server';

import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/auth';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the current user context using a server action
  const user = await getCurrentUser(true);

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    redirect('/sign-in');
  }

  // If onboarding is complete, redirect to the user's dashboard
  if (user.onboardingComplete && user.organizationId && user.userId) {
    redirect(`/${user.organizationId}/dashboard/${user.userId}`);
  }

  // Otherwise, render the onboarding flow
  return <>{children}</>;
}
