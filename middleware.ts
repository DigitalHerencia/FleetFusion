import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { RouteProtection } from '@/lib/auth/permissions';
import type { UserContext, ClerkOrganizationMetadata } from '@/types/auth';
import {
  SystemRoles,
  getPermissionsForRole,
  type SystemRole,
  type Permission,
} from '@/types/abac';

// 1. Define public routes (no auth/RBAC required)
const publicRoutePatterns = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/api/clerk/webhook-handler',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/services',
  '/privacy',
  '/terms',
  '/refund',
];
const isPublicRoute = createRouteMatcher(publicRoutePatterns);

// 2. RBAC session cache (optional, for performance)
const sessionCache = new Map<
  string,
  { userContext: UserContext; timestamp: number; ttl: number }
>();
const SESSION_CACHE_TTL = 30 * 1000; // 30 seconds

function getCachedUserContext(sessionId: string): UserContext | null {
  const cached = sessionCache.get(sessionId);
  if (cached && Date.now() - cached.timestamp < cached.ttl)
    return cached.userContext;
  if (cached) sessionCache.delete(sessionId);
  return null;
}
function setCachedUserContext(
  sessionId: string,
  userContext: UserContext
): void {
  sessionCache.set(sessionId, {
    userContext,
    timestamp: Date.now(),
    ttl: SESSION_CACHE_TTL,
  });
}

// 3. Utility: Build user context from session claims (Enhanced for custom session claims API)
function buildUserContext(
  userId: string,
  sessionClaims: Record<string, unknown>,
  orgId: string | null // This will be null since we're not using Clerk orgs
): UserContext {
  const claims = sessionClaims as any;
  
  // Priority order: ABAC claims > org claims > metadata > defaults
  // Extract from ABAC structure (our custom session claims API)
  const abacClaims = claims?.abac;
  
  const userRole: SystemRole =
    abacClaims?.role ||
    claims?.['org.role'] ||
    claims?.privateMetadata?.role ||
    claims?.publicMetadata?.role ||
    SystemRoles.MEMBER; // Default to member
    
  // Get permissions from ABAC claims, org membership, or derive from role
  const userPermissions: Permission[] = 
    abacClaims?.permissions ||
    claims?.['org_membership.permissions'] ||
    claims?.privateMetadata?.permissions ||
    getPermissionsForRole(userRole);
  
  // Get organizationId from ABAC claims, org context, or metadata
  const organizationId =
    abacClaims?.organizationId ||
    claims?.['org.id'] ||
    claims?.privateMetadata?.organizationId ||
    claims?.publicMetadata?.organizationId ||
    '';
    
  const onboardingComplete =
    claims?.publicMetadata?.onboardingComplete ||
    claims?.metadata?.onboardingComplete ||
    claims?.privateMetadata?.onboardingComplete ||
    false;
    
  const isActive = 
    claims?.metadata?.isActive !== false &&
    claims?.privateMetadata?.isActive !== false;  
  // Since we're not using Clerk orgs, create default org metadata
  const orgMetadata = claims?.publicMetadata?.organizationMetadata as
    | ClerkOrganizationMetadata
    | undefined;
    
  // Enhanced user info extraction with multiple fallbacks
  const firstName = claims?.firstName || claims?.first_name || '';
  const lastName = claims?.lastName || claims?.last_name || '';
  const fullName = claims?.fullName || `${firstName} ${lastName}`.trim() || '';
  const email = 
    claims?.primaryEmail ||
    claims?.primaryEmailAddress?.emailAddress ||
    claims?.emailAddresses?.[0]?.emailAddress ||
    '';
  
  return {
    userId,
    organizationId,
    role: userRole as SystemRole,
    permissions: userPermissions,
    isActive,
    name: firstName || fullName.split(' ')[0] || '',
    email,
    firstName,
    lastName,
    onboardingComplete,
    organizationMetadata: orgMetadata || {
      name: 'Default Organization',
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      maxUsers: 5,
      features: [],
      billingEmail: email,
      createdAt: new Date().toISOString(),
      settings: {
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        distanceUnit: 'miles',
        fuelUnit: 'gallons',
      },
    },
  };
}

// 4. Utility: Get dashboard path by role (used for redirects)
function getDashboardPath(userContext: UserContext): string {
  const orgId = userContext.organizationId;
  const userId = userContext.userId;
  switch (userContext.role) {
    case 'admin':
    case 'member':
      return `/${orgId}/dashboard/${userId}`;
    case 'dispatcher':
      return `/${orgId}/dispatch/${userId}`;
    case 'compliance':
      return `/${orgId}/compliance/${userId}`;
    case 'driver':
      return `/${orgId}/drivers/${userId}`;
    default:
      return '/';
  }
}

// 5. Utility: Create response with user/org headers and security enhancements
function createResponseWithHeaders(
  userContext: UserContext,
  orgId: string | null,
  req: NextRequest
): NextResponse {
  const response = NextResponse.next();
  
  // User context headers
  response.headers.set('x-user-role', userContext.role);
  if (userContext.permissions.length > 0) {
    response.headers.set(
      'x-user-permissions',
      JSON.stringify(userContext.permissions)
    );
  }
  if (orgId) {
    response.headers.set('x-organization-id', orgId);
  }
  
  // Security headers (additional runtime security)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; object-src 'none'; frame-ancestors 'none';"
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Rate limiting headers (basic implementation)
  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|scraper/i.test(userAgent);
  if (isBot) {
    response.headers.set('X-RateLimit-Limit', '10');
    response.headers.set('X-RateLimit-Remaining', '10');
  }
  
  return response;
}

// 6. Utility: Forbidden or redirect
function forbiddenOrRedirect(req: NextRequest, redirectUrl?: string) {
  const isApi =
    req.nextUrl.pathname.startsWith('/api/') ||
    req.headers.get('accept')?.includes('application/json');
  if (isApi) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  return NextResponse.redirect(new URL('/sign-in', req.url));
}

// 7. Main middleware logic
export default clerkMiddleware(async (auth, req: NextRequest) => {
  // [A] Intercept every request before route handlers/pages
  
  // Early exit for Clerk webhook handler
  if (req.nextUrl.pathname === '/api/clerk/webhook-handler') {
    return NextResponse.next();
  }
  
  // Basic security checks
  const userAgent = req.headers.get('user-agent') || '';
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // Block suspicious requests
  if (userAgent.length > 1000 || userAgent.includes('<script>')) {
    return new NextResponse('Bad Request', { status: 400 });
  }
  
  // CORS protection for API routes
  if (req.nextUrl.pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // [B] Check if route is public (no auth/RBAC required)
  if (isPublicRoute(req)) {
    // Allow public routes through
    return NextResponse.next();
  }
  // [C] Extract authentication credentials (session/cookies)
  const { userId, sessionClaims } = await auth(); // Remove orgId since we're not using Clerk orgs

  // [D] Validate credentials (is user authenticated?)
  if (!userId) {
    // Not authenticated: redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  // [E] Build user context (roles, permissions, org, etc.)
  const userOrgId = (sessionClaims as any)?.privateMetadata?.organizationId || 
                   (sessionClaims as any)?.publicMetadata?.organizationId || 
                   'no-org';
  const sessionId = `${userId}-${userOrgId}`;
  let userContext = getCachedUserContext(sessionId);
  if (!userContext) {
    userContext = buildUserContext(userId, sessionClaims, null); // Pass null for orgId
    setCachedUserContext(sessionId, userContext);
  }

  // [F] Determine requested route/resource (pathname)
  const pathname = req.nextUrl.pathname;
  // [G] Check org context in route vs. user context (if applicable)
  // Example: /[orgId]/...
  const orgPathMatch = pathname.match(
    /^\/([^\\/]+)\/(?:dashboard|drivers|dispatch|compliance|vehicles|analytics|ifta|settings)/
  );
  if (orgPathMatch && orgPathMatch[1]) {
    const requestedOrgId = orgPathMatch[1];
    if (
      userContext.organizationId &&
      userContext.organizationId !== requestedOrgId
    ) {
      // User's org does not match route org: redirect to correct dashboard
      return NextResponse.redirect(
        new URL(getDashboardPath(userContext), req.url)
      );
    }
  }

  // [H] Check RBAC policy for this route/resource
  if (!RouteProtection.canAccessRoute(userContext, pathname)) {
    // User does not have permission for this route
    return forbiddenOrRedirect(req, '/sign-in');
  }
  // [I] Allow request to proceed, attach user/org info as headers
  return createResponseWithHeaders(userContext, userContext.organizationId || null, req);
});

// 8. Next.js matcher config (which routes this middleware applies to)
export const config = {
  matcher: [
    // Include most routes, exclude static assets
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico)$).*)',
    // Include API routes
    '/api/:path*',
  ],
};
