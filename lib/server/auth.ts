// Minimal auth helper with test override support.
// In tests, set global.__TEST_AUTH_CONTEXT__ to bypass Clerk.
export type OrgContext = {
  orgId: string;
  userId: string;
  role?: string;
  permissions?: string[];
};

declare global {
  // Provided by tests to bypass Clerk/Edge middleware.
  // eslint-disable-next-line no-var
  var __TEST_AUTH_CONTEXT__: OrgContext | undefined;
}

async function requireOrgContext(): Promise<OrgContext> {
  if (global.__TEST_AUTH_CONTEXT__) {
    return global.__TEST_AUTH_CONTEXT__;
  }
  throw new Error('requireOrgContext is not implemented; middleware/Clerk not wired yet.');
}

async function assertRole(_role?: string): Promise<void> {
  if (global.__TEST_AUTH_CONTEXT__) {
    return;
  }
  throw new Error('assertRole is not implemented; RBAC not wired yet.');
}

export const auth = {
  requireOrgContext,
  assertRole,
};
