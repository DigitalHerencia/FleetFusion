/** @format */

import { NextRequest, NextResponse } from "next/server"

/**
 * Test-only API endpoint for setting up authentication state
 * This endpoint is only available in test/development environments
 */
export async function POST(request: NextRequest) {
    // Only allow in test environment
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { error: "Not available in production" },
            { status: 403 }
        )
    }

    try {
        const { userId, role, organizationId } = await request.json()

        // Create a mock JWT token with the required claims
        const mockJWT = createMockJWT({
            userId: userId || "user_admin123",
            role: role || "admin",
            organizationId: organizationId || "org1",
        })

        // Create response with authentication cookies
        const response = NextResponse.json({
            success: true,
            message: "Test authentication set up",
            userId,
            role,
            organizationId,
        })

        // Set cookies that the middleware will recognize
        response.cookies.set("__session", mockJWT, {
            httpOnly: true,
            secure: false, // Allow for localhost testing
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
        })

        response.cookies.set("__clerk_db_jwt", mockJWT, {
            httpOnly: true,
            secure: false,
            sameSite: "lax", 
            path: "/",
            maxAge: 60 * 60 * 24,
        })

        return response
    } catch (error) {
        console.error("Test auth setup error:", error)
        return NextResponse.json(
            { error: "Failed to setup test auth" },
            { status: 500 }
        )
    }
}

/**
 * Create a mock JWT token with the required session claims
 */
function createMockJWT(data: {
    userId: string
    role: string
    organizationId: string
}) {
    // Create a basic JWT structure (for testing only - not cryptographically secure)
    const header = {
        alg: "RS256",
        typ: "JWT",
    }

    const payload = {
        sub: data.userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        iss: "clerk-test",
        // ABAC claims structure that the middleware expects
        abac: {
            role: data.role,
            organizationId: data.organizationId,
            permissions: getPermissionsForRole(data.role),
        },
        // Additional claims the middleware looks for
        publicMetadata: {
            organizationId: data.organizationId,
            role: data.role,
            onboardingComplete: true,
        },
        firstName: "Test",
        lastName: "User",
        primaryEmail: "test@example.com",
    }

    // Create mock JWT (just base64 encoded - not signed for security since this is test-only)
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        "base64"
    )
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        "base64"
    )

    return `${encodedHeader}.${encodedPayload}.test-signature`
}

/**
 * Get permissions for a given role (simplified version)
 */
function getPermissionsForRole(role: string): string[] {
    switch (role) {
        case "admin":
            return ["admin:*", "read:*", "write:*"]
        case "dispatcher":
            return ["read:loads", "write:loads", "read:drivers", "read:vehicles"]
        case "driver":
            return ["read:own", "write:own"]
        case "compliance":
            return ["read:compliance", "write:compliance", "read:drivers"]
        default:
            return ["read:basic"]
    }
}