import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Public routes (no auth/RBAC required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/api/clerk/webhook-handler",
  "/about",
  "/contact",
  "/pricing",
  "/features",
  "/services",
  "/privacy",
  "/terms",
  "/refund",
])

// Admin RBAC route matcher
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(
  async (auth, req) => {
    // Protect all routes except public ones
    if (!isPublicRoute(req)) {
      await auth.protect()
    }
    // RBAC: Only allow users with 'admin' role to access /admin routes
    if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
  // Remove CSP configuration to allow Clerk to work properly
  // We'll implement security headers in next.config.ts if needed
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
