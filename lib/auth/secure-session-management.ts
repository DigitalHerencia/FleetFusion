/**
 * Session Management Security Enhancements
 * Addresses critical session cache vulnerabilities identified in security audit
 *
 * @format
 */

import type { UserContext } from "@/types/auth"

// Enhanced session cache with cleanup and invalidation
class SecureSessionCache {
    private cache = new Map<
        string,
        {
            userContext: UserContext
            timestamp: number
            ttl: number
            version: number // For cache invalidation
        }
    >()

    private cleanupInterval: NodeJS.Timeout
    private readonly CLEANUP_INTERVAL = 30000 // 30 seconds
    private readonly DEFAULT_TTL = 30000 // 30 seconds

    constructor() {
        // Automatic cleanup to prevent memory leaks
        this.cleanupInterval = setInterval(() => {
            this.cleanup()
        }, this.CLEANUP_INTERVAL)
    }

    /**
     * Get cached user context with automatic expiry check
     */
    get(sessionId: string): UserContext | null {
        const entry = this.cache.get(sessionId)
        if (!entry) return null

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(sessionId)
            return null
        }

        return entry.userContext
    }

    /**
     * Set user context in cache with versioning for invalidation
     */
    set(
        sessionId: string,
        userContext: UserContext,
        ttl = this.DEFAULT_TTL
    ): void {
        this.cache.set(sessionId, {
            userContext,
            timestamp: Date.now(),
            ttl,
            version: Date.now(), // Use timestamp as version
        })
    }

    /**
     * Invalidate all sessions for a specific user
     * Called when user role/organization changes
     */
    invalidateUser(userId: string): void {
        for (const [key] of this.cache.entries()) {
            if (key.startsWith(`${userId}-`)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Invalidate all sessions for an organization
     * Called when organization settings change
     */
    invalidateOrganization(orgId: string): void {
        for (const [key] of this.cache.entries()) {
            if (key.endsWith(`-${orgId}`)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Force invalidate a specific session
     */
    invalidateSession(sessionId: string): void {
        this.cache.delete(sessionId)
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now()
        let cleanupCount = 0

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key)
                cleanupCount++
            }
        }

        if (process.env.NODE_ENV === "development" && cleanupCount > 0) {
            console.log(
                `[Session Cache] Cleaned up ${cleanupCount} expired entries`
            )
        }
    }

    /**
     * Get cache statistics for monitoring
     */
    getStats() {
        return {
            size: this.cache.size,
            memoryUsage: process.memoryUsage().heapUsed,
            timestamp: new Date().toISOString(),
        }
    }

    /**
     * Graceful shutdown cleanup
     */
    destroy(): void {
        clearInterval(this.cleanupInterval)
        this.cache.clear()
    }
}

// Global session cache instance
export const sessionCache = new SecureSessionCache()

/**
 * Session invalidation functions for webhook handlers
 */
export const SessionInvalidation = {
    /**
     * Invalidate user sessions on role/organization changes
     */
    onUserUpdated: (userId: string) => {
        sessionCache.invalidateUser(userId)
    },

    /**
     * Invalidate organization sessions on settings changes
     */
    onOrganizationUpdated: (orgId: string) => {
        sessionCache.invalidateOrganization(orgId)
    },

    /**
     * Invalidate specific session (for security incidents)
     */
    onSecurityEvent: (userId: string, orgId: string) => {
        const sessionId = `${userId}-${orgId}`
        sessionCache.invalidateSession(sessionId)
    },
}

/**
 * Enhanced user context building with security validation
 */
export function buildSecureUserContext(
    userId: string,
    sessionClaims: Record<string, unknown>,
    orgId: string | null
): UserContext {
    // Validate session claims integrity
    if (!sessionClaims || typeof sessionClaims !== "object") {
        throw new Error("Invalid session claims structure")
    }

    // Extract organization ID with validation
    const claims = sessionClaims as any
    const organizationId =
        claims?.abac?.organizationId ||
        claims?.privateMetadata?.organizationId ||
        claims?.publicMetadata?.organizationId ||
        ""

    // Validate organization ID format
    if (organizationId && !/^[a-zA-Z0-9_-]+$/.test(organizationId)) {
        throw new Error("Invalid organization ID format")
    }

    // Build user context with enhanced validation
    const userContext: UserContext = {
        userId,
        organizationId,
        role: claims?.abac?.role || claims?.privateMetadata?.role || "member",
        permissions: claims?.abac?.permissions || [],
        isActive: claims?.metadata?.isActive !== false,
        name: claims?.firstName || "",
        email: claims?.primaryEmail || "",
        firstName: claims?.firstName || "",
        lastName: claims?.lastName || "",
        onboardingComplete: claims?.publicMetadata?.onboardingComplete || false,
        organizationMetadata: claims?.organizationMetadata || {
            name: "Default Organization",
            subscriptionTier: "free",
            subscriptionStatus: "inactive",
            maxUsers: 5,
            features: [],
            billingEmail: claims?.primaryEmail || "",
            createdAt: new Date().toISOString(),
            settings: {
                timezone: "UTC",
                dateFormat: "MM/DD/YYYY",
                distanceUnit: "miles",
                fuelUnit: "gallons",
            },
        },
    }

    return userContext
}

/**
 * Security monitoring hooks
 */
export const SecurityMonitoring = {
    /**
     * Log security events for audit trail
     */
    logSecurityEvent: (event: {
        type:
            | "SESSION_CREATED"
            | "SESSION_INVALIDATED"
            | "ACCESS_DENIED"
            | "PERMISSION_ESCALATION"
        userId: string
        orgId?: string
        details?: Record<string, any>
        timestamp?: Date
    }) => {
        const logEntry = {
            ...event,
            timestamp: event.timestamp || new Date(),
            source: "session_management",
        }

        // In production, send to monitoring service
        if (process.env.NODE_ENV === "production") {
            // TODO: Integrate with monitoring service (DataDog, New Relic, etc.)
            console.log("[SECURITY_EVENT]", JSON.stringify(logEntry))
        } else {
            console.log("[SECURITY_EVENT]", logEntry)
        }
    },

    /**
     * Monitor cache performance
     */
    monitorCachePerformance: () => {
        const stats = sessionCache.getStats()

        // Alert if cache size grows too large
        if (stats.size > 10000) {
            SecurityMonitoring.logSecurityEvent({
                type: "ACCESS_DENIED",
                userId: "SYSTEM",
                details: {
                    alert: "Session cache size exceeded threshold",
                    cacheSize: stats.size,
                },
            })
        }

        return stats
    },
}

// Graceful shutdown handler
process.on("SIGTERM", () => {
    sessionCache.destroy()
})

process.on("SIGINT", () => {
    sessionCache.destroy()
})
