import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import type {
  AuthenticatedIdentity,
  AuthenticatedSession,
  CurrentSessionContext,
  CurrentUserProfile,
} from "../../types/access";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthenticationRequiredError";
  }
}

export async function getIdentity(): Promise<AuthenticatedIdentity | null> {
  const { isAuthenticated, userId } = await auth();
  return isAuthenticated && userId ? { clerkUserId: userId } : null;
}

export async function requireIdentity(): Promise<AuthenticatedIdentity> {
  const identity = await getIdentity();
  if (!identity) throw new AuthenticationRequiredError();
  return identity;
}

export async function getCurrentSession(): Promise<CurrentSessionContext> {
  const session = await auth();
  return {
    isAuthenticated: session.isAuthenticated,
    clerkUserId: session.userId ?? null,
    clerkSessionId: session.sessionId ?? null,
  };
}

export async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session.isAuthenticated || !session.userId || !session.sessionId) {
    throw new AuthenticationRequiredError();
  }
  return {
    clerkUserId: session.userId,
    clerkSessionId: session.sessionId,
  };
}

export async function getCurrentUser(): Promise<CurrentUserProfile | null> {
  const user = await currentUser();
  if (!user) return null;

  return {
    clerkUserId: user.id,
    displayName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      null,
    primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
  };
}

export async function requireCurrentUser(): Promise<CurrentUserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationRequiredError();
  return user;
}
